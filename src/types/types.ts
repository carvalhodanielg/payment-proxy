export type ReceivedPayment = {
    correlationId: string;
    amount: number;
}

export type PaymentStatus = "queued" | "processing" | "done"

export type PaymentData = ReceivedPayment & {
    requestedAt: number;
    status: PaymentStatus;
}