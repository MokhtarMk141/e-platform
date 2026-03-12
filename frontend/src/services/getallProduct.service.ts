import { ApiClient } from "@/lib/api-client";
import { ProductResponse , ProductListResponse} from "@/types/product.types";
import { promises } from "dns";
export class GetProductService {
    static getAll() : Promise<ProductListResponse>{
        return ApiClient.get<ProductListResponse>('/products');
    }
}