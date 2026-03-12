'use client'

import { useGetallProduct } from "@/hooks/userGetproducts"
import { Product } from '@/types/product.types'

export default function ProductsTable() {
  const { products, loading, error } = useGetallProduct()


  return (
    <div className="container">
      <h1 className="title">Products</h1>

      <table className="table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product: Product) => (
            <tr key={product.id}>
              <td>
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} className="product-img" />
                )}
              </td>
              <td>{product.name}</td>
              <td className="description">{product.description}</td>
              <td className="price">${product.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}