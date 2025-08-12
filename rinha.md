


## processor:
POST /payments
{
    "correlationId": "4a7901b8-7d26-4d9d-aa19-4dc1c7cf60b3",
    "amount": 19.90,
    "requestedAt" : "2025-07-15T12:34:56.000Z" //timestamp no formato ISO em UTC
}

HTTP 200 - Ok
{
    "message": "payment processed successfully"
}

## health check
GET /payments/service-health

HTTP 200 - Ok
{
    "failing": false,
    "minResponseTime": 100
}

1 req a cada 5s ->> http429

//Lembrar que os dois payment-processors podem estar indisponíveis simultaneamente
