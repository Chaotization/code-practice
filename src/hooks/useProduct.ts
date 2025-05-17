import React from 'react'
import Apis, {type  Product } from '../APIs/productAPIs'
import { useQuery } from '@tanstack/react-query'

type Props = {product: Product}

const useProduct = (id: string) => {
    const {data, isLoading, isError, error} = useQuery({
        queryKey: ['product', id],
        queryFn: () => Apis.getProductById(id),
        enabled: !!id
    })

    return {data, isLoading, isError, error};
}

export default useProduct; 
