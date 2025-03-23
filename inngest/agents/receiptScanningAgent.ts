import { createAgent, createTool, openai } from "@inngest/agent-kit";
import { anthropic } from "inngest";
import { z } from "zod";

const parsePDFTool = createTool({
    name:"parse-pdf",
    description:"Analyse the given PDF",
    parameters:z.object({
        pdfUrl:z.string()
    }),

    handler: async ({pdfUrl}, {step})=>{
        try {
            return await step?.ai.infer("parse-pdf",{
                model:anthropic({
                    model:"claude-3-5-sonnet-20241022",
                    defaultParameters:{
                        max_tokens:3094,
                    }
                }),
                body:{
                    messages:[
                        {
                            role:"user",
                            content:[
                                {
                                    type:"document",
                                    source:{
                                        type:"url",
                                        url:pdfUrl
                                    }
                                },
                                {
                                    type:"text",
                                    text:`Extract the data from the receipt and return the structured oputput as follows:
                                    {
                                    "merchant":{
                                            "name":"Store Name",
                                            "addres": "123 Main str City Country",
                                            "contact": "0778113122"
                                        },
                                    "transaction":{
                                        "date":"YYY-MM-DD",
                                        "receipt_number":"ABC12332",
                                        "payment_method":"Credit Card",
                                        },
                                    "items":[
                                            {
                                        "name":"Item 1",
                                        "quantity":2,
                                        "unit_price":10.00,
                                        "total_price":20.00,
                                            }   
                                        ]
                                    "totals":{
                                        "subtotal":20.00,
                                        "tax":2.00,
                                        "total":22.00,
                                        "currency":"USD"
                                        }    
                                    }
                                    `
                                }
                            ]
                        }
                    ]
                }
            })  
        } catch (error) {
            console.error(error);
            throw error;
        }
      
    }
})

export const receiptScanningAgent = createAgent({
    name:"Receipt Scanning Agent",
    description:
    "Processes receipt impages and PDFs to extract key information such as vendo names, dates amounts, and, line items",
    system:` You are an AI powered receipt scanning assistant. Your primary role is to accurately extract and structure
    relevant information from scanned receipts. Your task includes recognizing and parsing details such as:
    - Merchant information: Store name, address, contact details
    -Transaction details: Date time, receipt number, payment method
    - Itemised Purchases: Product names , quantities, individual prices, discounts
    - Total Amounts: Subtotal, taxes total paid and any applied discounts
    - Ensure high accuracy by detecting OCR errors and correcting misread text when possible.
    - Normalize dates, currency values and formatting for consistency.
    - If any key details are missing or unclear return a structured response indicating incomplete data.
    - Handle multiple formats , languages and varying receipt layouts efficiently.
    -Maintain a structured JSON output for easy integration with dtabases or expense tracking systems
    `,
    model:openai({
        model:"gpt-4o-mini",
        defaultParameters:{
            max_completion_tokens:3094,
        }
    }),
    tools:[parsePDFTool]
})