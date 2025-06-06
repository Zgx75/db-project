'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';

export type Groupbuy = {
  id: number;
  title: string;
  price: number;
  status: string;
  current_count: number;
  max_count: number;
  deadline: string;
  image_url?: string;
  description?: string;
  seller_name?: string;
};

interface ProductProps {
  product: Groupbuy;
  onShowModal: (product: Groupbuy, zoomImage?: boolean) => void; // 修改 onShowModal，添加 zoomImage 參數
  groupBuyId?: string;
  groupBuyOwner?: string;
  addToCart: (id: number, title: string, price: number, quantity: number) => void;
}

export function Product({
  product,
  onShowModal,
  groupBuyId,
  groupBuyOwner = '團長',
  addToCart,
}: ProductProps) {
  const [quantity, setQuantity] = useState(1);

  const isClosed = product.status.toLowerCase() === 'closed';
  const canAddToCart = !isClosed && product.current_count < product.max_count;

  const handleAddToCart = async () => {
    if (!canAddToCart || quantity <= 0) return;
  
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      alert('請先登入才能加入購物車');
      return;
    }
  
    try {
      const res = await fetch('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          
        },
        body: JSON.stringify({
          userId: user.id,
          groupBuyId: product.id,
          productName: product.title,
          quantity,
          unitPrice: product.price,
        }),
      });
  
      if (!res.ok) {
        const errData = await res.json();
        alert(`加入購物車失敗：${errData.error}`);
        return;
      }
  
      
      setQuantity(1);
    } catch (error) {
      console.error('加入購物車錯誤:', error);
      alert('加入購物車時發生錯誤');
    }
  };
  

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止點擊圖片時觸發模態框
    if (product.image_url) {
      onShowModal(product, true); // 點擊圖片時傳遞 zoomImage=true
    }
  };

  return (
    <TableRow
      onClick={() => !isClosed && onShowModal(product)} // 點擊其他部分時不放大圖片
      className={isClosed ? '' : 'cursor-pointer hover:bg-gray-100'}
    >
      <TableCell className="hidden sm:table-cell">
        {product.image_url ? (
          <img
            alt="Product image"
            className="w-14 h-14 object-cover rounded cursor-pointer"
            src={product.image_url}
            onClick={handleImageClick}
          />
        ) : (
          <span className="text-sm text-muted-foreground">無圖片</span>
        )}
      </TableCell>
      <TableCell className="font-medium">{product.title}</TableCell>
      <TableCell>{product.seller_name || '未知賣家'}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">{product.status}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">${Number(product.price).toFixed(2)}</TableCell>
      <TableCell className="hidden md:table-cell">
        {product.current_count} / {product.max_count}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {new Date(product.deadline).toLocaleDateString('zh-TW')}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max={product.max_count - product.current_count}
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, Math.min(Number(e.target.value), product.max_count - product.current_count)))
            }
            className="w-16 p-1 border rounded"
            disabled={isClosed}
          />
          <Button size="sm" onClick={handleAddToCart} disabled={!canAddToCart}>
            放入購物車
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}