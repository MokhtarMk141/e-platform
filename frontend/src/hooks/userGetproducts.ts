'use client'
import { GetProductService } from "@/services/getallProduct.service";
import { Product } from "@/types/product.types";
import { useState, useEffect } from 'react';

interface ProductReturn {
    products : Product[];
    loading : boolean;
    error : string | undefined;
    
} 

export function useGetallProduct() : ProductReturn{
    
  const [products , setProduct ]  = useState<Product[]>([])
  const [loading , setLoading] = useState(true);
  const [error , setError] = useState<string | undefined>(null);

  useEffect(()=>{
    const fetch = async ()=>{
        try{
        const res =  await GetProductService.getAll();
        setProduct(res.data);
        }catch(err : any ){
            setError(err.message || "faild to load ")
        } finally{
            setLoading(false);
        }

    }
    fetch();
  },[])
    return {products , loading , error}
}