import { v } from "convex/values"
import {mutation, query} from "./_generated/server"
export const generateUploadUrl = mutation({
    args:{},
    handler: async(ctx)=>{
        return await ctx.storage.generateUploadUrl();

    }
})

// Storing the receipt file and add it to the database

export const storeReceipt = mutation({
    args:{
        userId:v.string(),
        fileId:v.id("_storage"),
        fileName:v.string(),
        size:v.number(),
        mimeType:v.string(),

    },
    handler: async(ctx,args)=>{

        const receiptId = await ctx.db.insert("receipts",{
            userId:args.userId,
            fileName:args.fileName,
            fileId:args.fileId,
            uploadedAt:Date.now(),
            size:args.size,
            mimeType: args.mimeType,
            status:"pending",

            // Initialize extracted data fields as null
            merchantName:undefined,
            merchantAddress:undefined,
            merchantContact:undefined,
            transactionDate:undefined,
            transactionAmount:undefined,
            currency:undefined,
            items:[]
    
        })
        return receiptId

    }
})

// Get all of the receipts

export const getReceipts = query({
    args:{
        userId:v.string(),
    },
    handler: async(ctx, args)=>{
        // Get the receipts
    //   Only return the receipts for the authenticated user
    return await ctx.db
    .query("receipts")
    .filter((q)=>q.eq(q.field("userId"), args.userId))
    .order("desc")
    .collect()
    }
})

// Get receipt by id

export const getReceiptById = query({
    args:{
        id:v.id("receipts"),
    },
    handler: async(ctx, args)=>{
        // Get the receipts
    const receipt = await ctx.db.get(args.id);

    // Verifyuser has access to the receipt
    if(receipt){
        const identity = await ctx.auth.getUserIdentity()
        if(!identity){
            throw new Error("Not authenticated")
        }
        const userId = identity.subject;

        if(receipt.userId !==userId){
            throw new Error("Not authorized to access this receipt")
        }

        return receipt;
    }
    }
})


// Generate the download URL to display to user

export const getReceiptDownloadUrl = query({
    args:{
        fileId:v.id("_storage"),
    },
    handler:async(ctx,args)=>{
             // Get temp url that can be used to download the file

        return await ctx.storage.getUrl(args.fileId)
    }
})

// Updating the status of the receipt 

export const updateReceiptStatus = mutation({
    args:{
        id:v.id("receipts"),
        status:v.string(),
    },
    handler: async (ctx,args)=>{
        // Verify the user has access to the receipt
        const receipt = await ctx.db.get(args.id);
        if(!receipt){
            throw new Error("Receipt not found");
        }
        const identity = await ctx.auth.getUserIdentity();

        if(!identity){
            throw new Error("Not authenticated")
        }

       

        const userId = identity.subject;

        if(receipt.userId !==userId){
            throw new Error("Not authorizzed to update the receipt")
        }
        await ctx.db.patch(args.id,{
            status:args.status,
        });
        return true;

    }
})


export const deleteReceipt= mutation({
    args:{
        id:v.id("receipts")
    },
    handler: async(ctx, args)=>{
          // Verify the user has access to the receipt
          const receipt = await ctx.db.get(args.id);
          if(!receipt){
              throw new Error("Receipt not found");
          }
          const identity = await ctx.auth.getUserIdentity();
  
          if(!identity){
              throw new Error("Not authenticated")
          }
  
         
  
          const userId = identity.subject;
  
          if(receipt.userId !==userId){
              throw new Error("Not authorizzed to delete the receipt")
          }

          //Delelte the file from the storage

          await ctx.storage.delete(receipt.fileId);

        //   Dleete from record
        await ctx.db.delete(args.id)
    }
})

// Update receipt with the extracted info

export const updateReceiptWithExtractedData = mutation({
    args:{
        id:v.id("receipts"),
        fileDisplayName:v.string(),
        merchantName:v.string(),
        merchantAddress:v.string(),
        merchantContact:v.string(),
        transactionDate:v.string(),
        transactionAmount:v.string(),
        currency:v.string(),
        receiptSummary:v.string(),
        items:v.array(
            v.object({
                name:v.string(),
                quantity:v.number(),
                unitPrice:v.number(),
                totalPrice:v.number(),
            })
        )
    },
    handler:async (ctx,args)=>{
        const receipt = await ctx.db.get(args.id);

        if(!receipt){
            throw new Error("Receipt not found")
        }

        // Update the receipt with the extracted data
        await ctx.db.patch(args.id,{
            fileDisplayName:args.fileDisplayName,
            merchantName:args.merchantName,
            merchantAddress:args.merchantAddress,
            merchantContact:args.merchantAddress,
            transactionDate:args.transactionDate,
            transactionAmount:args.transactionAmount,
            currency:args.currency,
            receiptSummary:args.receiptSummary,
            items:args.items,
            status:"processed"
        })
        return {
            userId:receipt.userId
        }
    }
})