import React, { useRef } from "react";
import {
  Text,
  IconButton,
  Flex,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Input,
  FormErrorMessage,
  FormControl,
  useToast,
} from "@chakra-ui/react";
import { FaPlusSquare } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";

type FormData = {
  name: string;
};

type PropsType = {
  email: string;
  setDisableButton: Function;
  setActiveProject: Function;
};

type ProjectsType = {
  id: string;
  name: string;
  user: string;
};

const AddProjectSection = ({
  email,
  setDisableButton,
  setActiveProject,
}: PropsType) => {
  //Ref for the input field
  const projectRef = useRef<HTMLInputElement | null>(null);

  const toast = useToast();

  //Function to send the new project to the backend
  const addProject = (newProject: ProjectsType) => {
    return fetch("/api/projects", {
      method: "POST",
      body: JSON.stringify(newProject),
    });
  };

  // Function to handle the form submission
  const onSubmit = (formData: FormData) => {
    const newProject: ProjectsType = {
      id: uuidv4(),
      name: formData.name,
      user: email,
    };

    mutate(newProject);
  };
  // React Hook Form to handle form submission
  const {
    handleSubmit,
    register,
    clearErrors,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>();

  //Register the input field from React Hook Form
  const { ref, ...rest } = register("name", {
    required: "Project name is required",
  });

  //Update the cache
  const queryClient = useQueryClient();
  const { mutate } = useMutation(addProject, {
    //Reloads the cache with the updated notes
    onSettled: async (data) => {
      queryClient.invalidateQueries("projects");
      toast({
        title: "Project deleted 🎉",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      setDisableButton(false);

      //Get the project that was just added
      const project: ProjectsType = await data?.json();

      //Get list of projects to see if there are any
      const previousProjects: ProjectsType[] | undefined =
        queryClient.getQueryData("projects");

      //Set the added project as the current project if there are no other projects
      if (previousProjects?.length === 0) {
        setActiveProject(project.name);
      }
    },
  });

  return (
    <Flex pb={0} pt={"10"} justifyContent={"space-between"} px={"10"}>
      <Text color={"gray.700"} fontWeight={"bold"} fontSize={"2xl"}>
        Projects
      </Text>

      <Popover
        initialFocusRef={projectRef}
        closeOnBlur={true}
        closeOnEsc={true}
        onOpen={reset}
        onClose={clearErrors}
        returnFocusOnClose={false}
      >
        {({ onClose }) => (
          <>
            <PopoverTrigger>
              <IconButton
                aria-label={"Add Project"}
                color={"gray.700"}
                colorScheme="white"
                icon={<FaPlusSquare />}
              />
            </PopoverTrigger>
            <PopoverContent bg={"gray.700"} p={"5"}>
              <PopoverBody>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <FormControl isInvalid={true}>
                    <FormErrorMessage>
                      {errors.name && errors.name.message}
                    </FormErrorMessage>
                    <Input
                      m={"2"}
                      color={"gray.100"}
                      autoComplete={"off"}
                      placeholder="Enter a new project name"
                      focusBorderColor="none"
                      errorBorderColor="none"
                      {...rest}
                      ref={(e) => {
                        ref(e);
                        projectRef.current = e; // you can still assign to ref
                      }}
                    />
                  </FormControl>
                  <Button
                    type="submit"
                    onClick={() => {
                      onClose();
                    }}
                    m={"2"}
                    w={"100%"}
                  >
                    Add Project
                  </Button>
                </form>
              </PopoverBody>
            </PopoverContent>
          </>
        )}
      </Popover>
    </Flex>
  );
};

export default AddProjectSection;
