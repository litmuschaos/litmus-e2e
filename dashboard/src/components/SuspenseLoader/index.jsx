import React, { Suspense } from 'react';
import Center from '../../containers/layouts/Center';
import Loader from '../Loader';

export const SuspenseLoader = ({
  children,
  style,
}) => {
  return (
    <Suspense
      fallback={
        <div style={style ?? {}}>
          <Center>
            <Loader />
          </Center>
        </div>
      }
    >
      {children}
    </Suspense>
  );
};
