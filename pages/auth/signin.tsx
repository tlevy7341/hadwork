import type { NextPage, NextPageContext } from "next";
import Head from "next/head";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { VStack, HStack, Center, Button, Heading } from "@chakra-ui/react";
import { getProviders, signIn, useSession } from "next-auth/react";

const SignIn: NextPage = ({ providers }: any) => {
  const { push } = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      push("/");
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>Login | HadWork</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {session ? (
        <Center bg={"gray.100"} color={"gray.700"}>
          <Heading>Redirecting...</Heading>
        </Center>
      ) : (
        <VStack pt={4} bg={"gray.100"} color={"gray.700"} height={"100vh"}>
          <HStack>
            <Heading size="3xl">HadWork</Heading>
          </HStack>

          <VStack justify={"center"} height={"100vh"} spacing={4}>
            {Object.values(providers).map((provider: any) => (
              <div className="my-6" key={provider.name}>
                <Button
                  colorScheme="linkedin"
                  onClick={() => signIn(provider.id)}
                >
                  Sign in with {provider.name}
                </Button>
              </div>
            ))}
          </VStack>
        </VStack>
      )}
    </>
  );
};

export default SignIn;

export const getServerSideProps = async (context: NextPageContext) => {
  const providers = await getProviders();
  return {
    props: { providers },
  };
};
