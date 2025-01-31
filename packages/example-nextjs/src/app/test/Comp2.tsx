'use client';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { useUrlEncode } from 'state-in-url';

import { stateShape } from './state';
import { Textarea } from './Textarea';
import { toJSON } from './utils';

export const Comp2 = ({ className }: { className: string }) => {
  const searchParams = useSearchParams();

  const { parse } = useUrlEncode(stateShape);

  return (
    <Textarea
      className={className}
      value={toJSON(parse(searchParams))}
      data-testid="parsed"
      onChange={() => {}}
    ></Textarea>
  );
};
