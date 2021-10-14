import React, { Suspense } from "react";
import Center from "../../containers/layouts/Center";
import Loader from "../Loader";

const SuspenseLoader = ({ children, style }) => (
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

export default SuspenseLoader;
