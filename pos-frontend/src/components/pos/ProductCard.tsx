'use client';

import { Box, Typography, Tooltip } from '@mui/material';
import { ProductWithAvailability } from '@/store/api/productsApi';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, selectCartItems } from '@/store/slices/cartSlice';

interface Props {
  product: ProductWithAvailability;
}

const CARD_WIDTH = 232;
const CARD_HEIGHT = 270;
const IMAGE_SIZE = 150;
const IMAGE_OVERFLOW = IMAGE_SIZE / 2;

export function ProductCard({ product }: Props) {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartItem = cartItems.find((i) => i.productId === product._id);
  const isOutOfStock = product.availableQty === 0;
  const cartQty = cartItem?.quantity ?? 0;
  const canAdd = cartQty < product.availableQty;

  const handleClick = () => {
    if (!canAdd) return;
    dispatch(
      addToCart({
        productId: product._id,
        productName: product.name,
        price: product.price,
        availableQty: product.availableQty,
        image: product.image,
      }),
    );
  };

  return (
    <Tooltip
      title={
        isOutOfStock
          ? 'Out of stock'
          : !canAdd
            ? `Max available: ${product.availableQty}`
            : ''
      }
      placement="top"
    >
      <Box
        onClick={handleClick}
        sx={{
          position: 'relative',
          width: { xs: 160, sm: 200, md: CARD_WIDTH },
          height: { xs: CARD_HEIGHT + IMAGE_OVERFLOW - 40, sm: CARD_HEIGHT + IMAGE_OVERFLOW - 20, md: CARD_HEIGHT + IMAGE_OVERFLOW },
          cursor: isOutOfStock || !canAdd ? 'not-allowed' : 'pointer',
          opacity: isOutOfStock ? 0.5 : 1,
          transition: 'transform 0.2s ease',
          '&:hover': !isOutOfStock && canAdd ? { transform: 'translateY(-6px)' } : {},
          flexShrink: 0,
        }}
      >
        {/* Card body */}
        <Box
          sx={{
            position: 'absolute',
            top: IMAGE_OVERFLOW,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: '#1F1D2B',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            pt: `${IMAGE_OVERFLOW + 12}px`,
            pb: 3,
            px: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {/* Name */}
          <Typography
            sx={{
              fontWeight: 600,
              color: '#FFFFFF',
              fontSize: '15px',
              lineHeight: 1.35,
              mb: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.name}
          </Typography>

          {/* Price */}
          <Typography
            sx={{
              fontWeight: 500,
              color: '#FFFFFF',
              fontSize: '15px',
              mb: 1,
            }}
          >
            $ {product.price.toFixed(2)}
          </Typography>

          {/* Availability */}
          <Typography
            sx={{
              fontWeight: 400,
              color: '#ABBBC2',
              fontSize: '13px',
            }}
          >
            {isOutOfStock ? 'Out of stock' : `${product.availableQty} Bowls available`}
          </Typography>
        </Box>

        {/* Circular image overflowing top */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            borderRadius: '50%',
            overflow: 'hidden',
            zIndex: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          <Box
            component="img"
            src={product.image || `https://placehold.co/${IMAGE_SIZE}x${IMAGE_SIZE}?text=Dish`}
            alt={product.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: isOutOfStock ? 'grayscale(100%)' : 'none',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://placehold.co/${IMAGE_SIZE}x${IMAGE_SIZE}?text=Dish`;
            }}
          />
        </Box>

        {/* Cart quantity badge */}
        {cartQty > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 4,
              right: 20,
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              zIndex: 2,
              boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
            }}
          >
            {cartQty}
          </Box>
        )}
      </Box>
    </Tooltip>
  );
}
