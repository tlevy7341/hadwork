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
    onMutate: (addedProject: ProjectsType) => {
      //Get list of projects to see if there are any
      const previousProjects: ProjectsType[] | undefined =
        queryClient.getQueryData("projects");

      //Optimistically update the UI
      queryClient.setQueryData("projects", (prevProjects: any) => {
        return [addedProject, ...prevProjects].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      });

      //Set the added project as the current project if there are no other projects
      setActiveProject(addedProject.name);

      setDisableButton(false);

      return { previousProjects };
    },
    //If there was an error updating the cache, rollback the data
    onError: (error, addedProject: ProjectsType, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData("projects", context.previousProjects);
      }
    },
    //Reloads the cache with the updated notes
    onSettled: async (data) => {
      queryClient.invalidateQueries("projects");
      toast({
        title: "Project deleted 🎉",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
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
                      if (isValid) {
                        onClose();
                      }
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
