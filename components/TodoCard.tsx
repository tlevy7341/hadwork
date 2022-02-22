import React, { useState } from "react";
import {
  Flex,
  Input,
  IconButton,
  useToast,
  Text,
  FormControl,
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  Box,
} from "@chakra-ui/react";
import { BsX, BsCheck, BsThreeDots } from "react-icons/bs";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import { useDrag } from "react-dnd";

type PropTypes = {
  id: string;
  task: string;
  status: string;
  projectName: string;
};

type FormData = {
  task: string;
};

type TodosType = {
  id: string;
  task: string;
  status: string;
  projectName: string;
};

const ItemTypes = {
  CARD: "card",
};

const TodoCard = ({ id, task, status, projectName }: PropTypes) => {
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();

  //To implement dragging effect for each card
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: {
      id: id,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // React Hook Form to handle form submission
  const {
    handleSubmit,
    register,
    setFocus,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<FormData>({
    defaultValues: {
      task: task,
    },
  });

  //Function to handle form submission
  const onSubmit = (formdata: FormData) => {
    setEditing(false);
    editMutation.mutate({ id, task: formdata.task, status, projectName });
  };

  //Function to edit a project
  const editTodo = (projectToEdit: TodosType) => {
    return fetch("/api/todos", {
      method: "PUT",
      body: JSON.stringify(projectToEdit),
    });
  };

  //React Query Function used to update the cache for editing a todo
  const editMutation = useMutation(editTodo, {
    onSuccess: () => {
      queryClient.invalidateQueries("todos", { exact: false });
    },
  });

  //Function to delete a project
  const deleteTodo = (todoToDelete: TodosType) => {
    return fetch("/api/todos", {
      method: "DELETE",
      body: JSON.stringify(todoToDelete),
    });
  };

  //React Query Function used to update the cache for deleting a project
  const deleteMutation = useMutation(deleteTodo, {
    onMutate: (deletedTodo: TodosType) => {
      const previousTodos = queryClient.getQueryData("todos", { exact: false });
      queryClient.setQueryData(["todos", projectName], (prevNotes: any) => {
        return prevNotes.filter(
          (todo: TodosType) => todo.id !== deletedTodo.id
        );
      });
      return { previousTodos };
    },
    //If there was an error updating the cache, rollback the data
    onError: (error, newTodo: TodosType, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos", projectName], context.previousTodos);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries("todos", { exact: false });
      toast({
        title: "Todo deleted 🎉",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    },
  });

  return (
    <>
      <Text textAlign={"center"} fontWeight={"semibold"} color={"red.500"}>
        {errors.task && errors.task.message}
      </Text>
      <Flex
        cursor={"grab"}
        justifyContent={"space-between"}
        alignItems={"center"}
        rounded={"10"}
        p={"2"}
        m={"5"}
        bg={"gray.700"}
        color={"gray.100"}
        ref={drag}
        opacity={isDragging ? "0.5" : 1}
      >
        <form>
          <FormControl isInvalid={!isSubmitSuccessful}>
            <Input
              cursor={editing ? "initial" : "grab"}
              ms={"2"}
              autoComplete={"off"}
              isReadOnly={!editing}
              focusBorderColor={"none"}
              errorBorderColor={"none"}
              borderWidth={"0"}
              {...register("task", {
                required: "Task is required",
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
          <Box pr={"2"}>
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
                    setFocus("task");
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
                    deleteMutation.mutate({ id, status, projectName, task });
                  }}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        )}
      </Flex>
    </>
  );
};

export default TodoCard;
