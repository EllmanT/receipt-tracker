"use client"

import React, { useCallback, useState } from 'react'

import {
    DndContext,useSensor,useSensors,PointerSensor
} from "@dnd-kit/core";

function PDFDropzone() {

    const [isDraggingOver, setIsDraggingOver]= useState(false)


    const handleDragLeave = useCallback((e:React.DragEvent)=>{
        e.preventDefault();
        setIsDraggingOver(false);
},[]);
const handleDragOver = useCallback((e:React.DragEvent)=>{
    e.preventDefault();
    setIsDraggingOver(true);
},[]);

const handleDrop = useCallback((e:React.DragEvent)=>{
    e.preventDefault();
    setIsDraggingOver(false);
    console.log("Dropped")
},[user, handleUpload]);

    const sensors = useSensors(useSensor(PointerSensor))

    const canUpload = true
  return (
    <DndContext sensors={sensors}>
        <div className='w-full max-w-md mx-auto bg-red'>
            <div
            onDragOver={canUpload ?handleDragOver:undefined}
            onDragLeave={canUpload? handleDragLeave:undefined}
            onDrop={canUpload?handleDrop:(e)=>e.preventDefault()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDraggingOver ? "border-blue-600 bg-blue-50": "border-gray-300"}${!canUpload?"opacity-70 cursor-not-allowed":""}`}
            >

            </div>
            </div>    
    </DndContext>
  )
}

export default PDFDropzone