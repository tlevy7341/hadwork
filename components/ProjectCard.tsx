import React, { useState, useRef } from "react";
import {
  Box,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  Input,
  MenuItem,
  useToast,
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";
import { BsThreeDots, BsX, BsCheck } from "react-icons/bs";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";

type PropsType = {
  id: string;
  setActiveProject: Function;
  name: string;
  user: string;
  setDisableButton: Function;
};

type FormData = {
  name: string;
};

type ProjectsType = {
  id: string;
  name: string;
  user: string;
};

const ProjectCard = ({
  name,
  id,
  user,
  setActiveProject,
  setDisableButton,
}: PropsType) => {
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();

  // React Hook Form to handle form submission
  const {
    handleSubmit,
    register,
    setFocus,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<FormData>({
    defaultValues: {
      name: name,
    },
  });

  //Function used to submit the form
  const onSubmit = (formData: FormData) => {
    setEditing(false);
    editMutation.mutate({ id, name: formData.name, user });
  };

  //Function to delete a project
  const deleteProject = (projectToDelete: ProjectsType) => {
    return fetch("/api/projects", {
      method: "DELETE",
      body: JSON.stringify(projectToDelete),
    });
  };

  //Function to edit a project
  const editProject = (projectToEdit: ProjectsType) => {
    return fetch("/api/projects", {
      method: "PUT",
      body: JSON.stringify(projectToEdit),
    });
  };

  //React Query Function used to update the cache for deleting a project
  const deleteMutation = useMutation(deleteProject, {
    onMutate: (deletedProject: ProjectsType) => {
      //Set a different project after current project is deleted
      const previousProjects: ProjectsType[] | undefined =
        queryClient.getQueryData("projects");

      const projects = previousProjects?.filter(
        (project) => project.name !== deletedProject.name
      );

      if (projects && projects.length > 0) {
        const randomProject =
          projects[Math.floor(Math.random() * projects.length)];
        setActiveProject(randomProject.name);
      } else {
        setActiveProject(null);
        setDisableButton(true);
      }

      //Remove project from localStorage if set
      const project = localStorage.getItem("activeProject");
      if (project === deletedProject.name) {
        localStorage.removeItem("activeProject");
      }

      return { previousProjects };
    }, //If there was an error updating the cache, rollback the data
    onError: (error, deletedProject: ProjectsType, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData("notes", context.previousProjects);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries("projects");

      toast({
        title: "Project deleted 🎉",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    },
  });

  //React Query Function used to update the cache for editing a project
  const editMutation = useMutation(editProject, {
    onSuccess: () => {
      queryClient.invalidateQueries("projects");
    },
  });

  return (
    <Box
      onClick={() => {
        setActiveProject(name);
        setDisableButton(false);
        localStorage.setItem("activeProject", name);
      }}
      cursor={"pointer"}
      my={"4"}
      borderWidth={"3px"}
      borderColor={"gray.400"}
      bg={"gray.700"}
      color={"gray.100"}
      boxShadow={"md"}
      rounded={"6"}
      p={"2"}
      mx={"10"}
    >
      <Flex justifyContent={"space-between"} alignItems={"center"}>
        <form>
          <FormControl isInvalid={!isSubmitSuccessful}>
            <FormErrorMessage>
              {errors.name && errors.name.message}
            </FormErrorMessage>
            <Input
              ms={"2"}
              focusBorderColor={"none"}
              errorBorderColor={"none"}
              fontWeight={"semibold"}
              borderWidth={"0"}
              cursor={editing ? "initial" : "pointer"}
              isReadOnly={!editing}
              {...register("name", {
                required: "Project name is required",
              })}
            />
          </FormControl>
        </form>
        {editing ? (
          <Flex>
            <IconButton
              onClick={() => {
                reset();
                setEditing(false);
              }}
              aria-label="Cancel changes"
              _hover={{ bg: "gray.600" }}
              _active={{ bg: "gray.600" }}
              _focus={{ outline: "none" }}
              variant={"ghost"}
              color={"red.600"}
              icon={<BsX />}
            />
            <IconButton
              //onClick={handleOnCheck}
              _hover={{ bg: "gray.600" }}
              _active={{ bg: "gray.600" }}
              _focus={{ outline: "none" }}
              aria-label="Save changes"
              color={"green.600"}
              variant={"ghost"}
              icon={<BsCheck />}
              onClick={handleSubmit(onSubmit)}
            />
          </Flex>
        ) : (
          <Menu autoSelect={false}>
            <MenuButton>
              <BsThreeDots />
            </MenuButton>
            <MenuList bg={"gray.700"} color={"gray.100"}>
              <MenuItem
                _hover={{ bg: "gray.600" }}
                bg={"gray.700"}
                color={"gray.100"}
                onClick={() => {
                  setFocus("name");
                  setEditing(true);
                }}
              >
                Edit
              </MenuItem>
              <MenuItem
                _hover={{ bg: "gray.600" }}
                bg={"gray.700"}
                color={"gray.100"}
                onClick={() => {
                  deleteMutation.mutate({ id, name, user });
                }}
              >
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>
    </Box>
  );
};

export default ProjectCard;
