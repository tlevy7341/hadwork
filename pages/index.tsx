import { useState, useEffect } from "react";
import {
  FaHourglassStart,
  FaHourglassHalf,
  FaHourglassEnd,
} from "react-icons/fa";
import {
  Center,
  Grid,
  GridItem,
  Text,
  Heading,
  Divider,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import type { NextPage, NextPageContext } from "next";
import { useQuery, QueryClient, dehydrate, useQueryClient } from "react-query";
import { useSession, getSession } from "next-auth/react";
import Head from "next/head";
import MenuHeader from "../components/MenuHeader";
import ProgressBox from "../components/ProgressBox";
import AddProjectSection from "../components/AddProjectSection";
import ProjectCard from "../components/ProjectCard";

type ProjectsType = {
  id: string;
  name: string;
  user: string;
  Todos: TodosType[];
};

type TodosType = {
  id: string;
  task: string;
  project_name: string;
  status: string;
};

const getProjects = async () => {
  const response = await fetch("http://localhost:3000/api/projects");
  return response.json();
};

const Home: NextPage = () => {
  const [disableButton, setDisableButton] = useState(true);
  const { push } = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [activeProject, setActiveProject] = useState(() => {
    const projects: ProjectsType[] | undefined =
      queryClient.getQueryData("projects");
    let initialState;
    if (
      typeof window !== "undefined" &&
      localStorage.getItem("activeProject") !== null
    ) {
      initialState = localStorage.getItem("activeProject");
    } else if (projects) {
      const randomProject =
        projects[Math.floor(Math.random() * projects.length)];
      initialState = randomProject.name;
    } else {
      initialState = "";
    }

    return initialState;
  });

  const { data } = useQuery<ProjectsType[], Error>("projects", getProjects);

  useEffect(() => {
    if (!session?.user) {
      push("/auth/signin");
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>Home | HadWork</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!session ? (
        <Center height={"100vh"} width={"100vw"}>
          <Text fontSize="3xl">Redirecting...</Text>
        </Center>
      ) : (
        <Grid
          h={"100vh"}
          templateRows={{ base: "1fr", xl: "repeat(2, 1fr)" }}
          templateColumns={{ base: "1fr", xl: "repeat(5, 1fr)" }}
        >
          <GridItem
            bg={"gray.200"}
            rowSpan={{ base: 1, xl: 2 }}
            colSpan={{ base: 0, xl: 1 }}
          >
            <MenuHeader email={session!.user!.email!} />
            <AddProjectSection
              email={session!.user!.email!}
              setDisableButton={setDisableButton}
              setActiveProject={setActiveProject}
            />
            <Divider
              ml={10}
              w={"78%"}
              variant={"solid"}
              bg={"gray.700"}
              h={0.5}
            />
            {data &&
              data.map((project) => {
                return (
                  <ProjectCard
                    key={project.name}
                    name={project.name}
                    id={project.id}
                    user={project.user}
                    setActiveProject={setActiveProject}
                    setDisableButton={setDisableButton}
                  />
                );
              })}
          </GridItem>
          <GridItem rowSpan={2} colSpan={4} bg="gray.50">
            <VStack pt={"2"}>
              <Heading suppressHydrationWarning color={"gray.700"}>
                {activeProject}
              </Heading>
            </VStack>
            <SimpleGrid
              minH={"400px"}
              p={"10"}
              columns={{ base: 1, xl: 3 }}
              spacing={10}
            >
              <ProgressBox
                title={"Todo"}
                activeProject={activeProject}
                disableButton={disableButton}
                icon={<FaHourglassStart />}
              />
              <ProgressBox
                title={"Doing"}
                activeProject={activeProject}
                icon={<FaHourglassHalf />}
              />
              <ProgressBox
                title={"Done"}
                activeProject={activeProject}
                icon={<FaHourglassEnd />}
              />
            </SimpleGrid>
          </GridItem>
        </Grid>
      )}
    </>
  );
};

export default Home;

export const getServerSideProps = async (context: NextPageContext) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery("projects", getProjects);
  return {
    props: {
      projects: { dehydratedState: dehydrate(queryClient) },
      session: await getSession(context),
    },
  };
};
