import Image from 'next/image';
import React from 'react';

export const Logo = () => {
  return (
    <Image
      src='https://res.cloudinary.com/dnvsfxlan/image/upload/v1754824130/Group_1000001891_2_tybmb9.svg'
      alt='ShowStakr Logo'
      width={50}
      height={50}
      className='w-full h-full object-contain'
    />
  );
};
