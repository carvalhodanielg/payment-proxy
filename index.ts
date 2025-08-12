import { type BunRequest } from "bun";
import type { ReceivedPayment } from "./src/types/types";

import Redis from "ioredis"
import ts from "typescript";

const REDIS_URL = process.env.REDIS_URL ?? "redis://redis:6379";
const PORT = Number(process.env.PORT ?? 3000);
const PROCESSOR_PRIMARY = process.env.PROCESSOR_PRIMARY ?? "http://processor-primary";
const PROCESSOR_FALLBACK = process.env.PROCESSOR_FALLBACK ?? "http://processor-fallback";

const redis = new Redis(REDIS_URL)

const QUEUE_KEY = "payments:queue";        // list for BRPOP
const PAYMENT_HASH_PREFIX = "payment:";    // payment:{id} -> hash
const AUDIT_STREAM = "payments:stream";    // (optional) append-only stream for auditing

const healthCache: Record<string, { ok: boolean; ts: number; latency?: number }> = {};

function genId() {
    return `${Date.now()}-${Math.floor(Math.random()*900000 + 100000)}`;
  }
  function now() { return Date.now(); }

/**
 * Ver se dá pra trocar esse genId pelo id recebido no payment (correlationId)
 */
const queuePayment = async (payment: ReceivedPayment) => {
    
    const id = genId();

    const key = PAYMENT_HASH_PREFIX + id;
    const nowTs = Date.now();
   
    const paymentData = {
        ...payment,
        createdAt:  String(nowTs),
    status: "queued"
    }

    await redis.hset(key, paymentData)

    await redis.rpush(QUEUE_KEY, id)

    await redis.xadd(AUDIT_STREAM, "*", "id", id, "event", "enqueued", "amount", String(payment.amount), "ts", String(nowTs));

    return id
}

async function callProcessor(url: string, payload: any, timeoutMs = 800){
    try{
        const res = await fetch(url + "/payments", {
            method: "POST",
            headers: {"content-type": "application/json"},
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(timeoutMs)

        })


        if(!res.ok) throw new Error(`status ${res.status}`)
        const json = await res.json().catch(() => ({}))
        return json

        
    }catch(e){
        throw e
    }
}

const fetchProcessorHealth = async(url: string) => {

    const cached = healthCache[url]
    if(cached && now() - cached.ts < 5000) return cached


    try{
        const start = Date.now()
        const res = await fetch(url + "/payments/service-health",{ method: "GET" , signal: AbortSignal.timeout(1000) } )
        const json = await res.json().catch(() => ({ok: false})) as {ok: boolean}

        //acho que recebo a latencia no retorno do endpoint
        const latency = Date.now() - start;

        healthCache[url] = {ok: !!json.ok , ts: now(), latency}
        return healthCache[url]


    }catch(e){
        healthCache[url] = {ok: false, ts: now()}
        return healthCache[url]
    }

}

async function workerLoop() {
    while(true){
        try{
            const res = await redis.brpop(QUEUE_KEY, 5)

            if(!res) continue;

            const id = res[1];
            const key = PAYMENT_HASH_PREFIX + id;


            const current = await redis.hget(key, "status")
            if(current === "processing" || current === "done"){
                continue
            }

            await redis.hset(key, "status", "processing", "workerStartedAt", String(Date.now()))
            await redis.xadd(AUDIT_STREAM, "*", "id", id, "event", "processing", "ts", String(Date.now()))

            const payment = await redis.hgetall(key);
            const amount = Number(payment.amount ?? 0)

            const primaryHealth = await fetchProcessorHealth(PROCESSOR_PRIMARY)

            const usePrimary = primaryHealth.ok;

            let chosen = usePrimary ? PROCESSOR_PRIMARY : PROCESSOR_FALLBACK


            let remoteResult: any = null

            try{
                remoteResult = await callProcessor(chosen, {id, amount}, 900)
            }catch(e){
                await redis.xadd(AUDIT_STREAM, "*", "id", id, "event", "processor_failed", "url", chosen, "err", String(e), "ts", String(Date.now()))

                if(chosen === PROCESSOR_PRIMARY){
                    try{
                        chosen = PROCESSOR_FALLBACK
                        remoteResult = await callProcessor(chosen, {id, amount}, 1200)
                    }catch(e2){
                        await redis.hset(key, "status", "failed", "workerError", String(e2), "processedAt", String(Date.now()))
                        await redis.xadd(AUDIT_STREAM, "*", "id", id, "event", "failed", "err", String(e2), "ts", String(Date.now()))
                        continue
                    }
                }else{
                    await redis.hset(key, "status", "failed", "workerError", String(e), "processedAt", String(Date.now()));
                    await redis.xadd(AUDIT_STREAM, "*", "id", id, "event", "failed", "err", String(e), "ts", String(Date.now()));
                    continue;
                }
            }

            await redis.hset(key,
                "status", "done",
                "processor", chosen,
                "remoteInfo", JSON.stringify(remoteResult ?? {}),
                "processedAt", String(Date.now())
            )
            await redis.xadd(AUDIT_STREAM, "*", "id", id, "event", "done", "processor", chosen, "ts", String(Date.now()))

        }catch(e){
            console.error("Worker loop error",e)
            await new Promise(resolve => setTimeout(resolve, 500))
        }
    }
}

workerLoop().catch(err => console.error("workerLooop crashed", err))

const server = Bun.serve({
  port: 3000,
  development: false,
  routes: {
    "/payments": {
      POST: async (req: BunRequest) => {
        const payment= await req.json();
        
        console.log(payment);

        const redisPayment = await queuePayment(payment as ReceivedPayment)

        //validar se o payment é valido
        

        
        //mandar pro redis    
        return new Response()
    },
    },
    "/payments-summary": {
      GET: () => new Response("Hello via Bun!"),
    },
    "/payments/service-health": {
      GET: () => new Response("Hello via Bun!"),
    },
  },
 
});

console.log(`Server is running on ${server.url}`);

//erro 500

//disponibilizar:
//POST /payments
//GET /payments-summary

//consumir:
//GET /payments/service-health
//status 429 - Too Many Requests

