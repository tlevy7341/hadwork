import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function MyApp({ Component, pageProps }: AppProps) {
  const queryClient: QueryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <SessionProvider session={pageProps.session}>
          <ChakraProvider>
            <DndProvider backend={HTML5Backend}>
              <Component {...pageProps} />
            </DndProvider>
          </ChakraProvider>
        </SessionProvider>
      </Hydrate>
    </QueryClientProvider>
  );
}

export default MyApp;
