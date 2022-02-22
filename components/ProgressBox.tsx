import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  IconButton,
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
import { useDrop } from "react-dnd";
import TodoCard from "./TodoCard";
import { useQuery, useQueryClient, useMutation } from "react-query";
import { FaPlusSquare } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { useForm } from "react-hook-form";

const ItemTypes = {
  CARD: "card",
};

type PropTypes = {
  title: string;
  icon: any;
  activeProject: string | null;
  disableButton?: boolean;
};

type FormData = {
  task: string;
};

type TodosType = {
  id: string;
  task: string;
  projectName: string;
  status: string;
};

const ProgressBox = ({
  title,
  icon,
  activeProject,
  disableButton,
}: PropTypes) => {
  const taskRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  //Function to update the status of the Todo
  const updateTodo = (todoToUpdate: TodosType) => {
    return fetch("/api/todos", {
      method: "PUT",
      body: JSON.stringify(todoToUpdate),
    });
  };

  //React Query to mutate the status of the Todo
  const editMutation = useMutation(updateTodo, {
    //Update the UI prior to the cache updating
    onMutate: (editedTodo: TodosType) => {
      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData(["todos", activeProject], {
        exact: false,
      });
      // Optimistically update to the new value
      queryClient.setQueryData(["todos", activeProject], (prevTodos: any) => {
        return prevTodos.filter((todo: TodosType) =>
          todo.id === editedTodo.id ? editedTodo : todo
        );
      });
      // Return a context object with the snapshotted value
      return { previousTodos };
    },
    //If there was an error updating the cache, rollback the data
    onError: (error, newNote: TodosType, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(
          ["todos", activeProject],
          context.previousTodos
        );
      }
    },
    //Reloads the cache with the updated todos
    onSettled: () => {
      queryClient.invalidateQueries(["todos", activeProject]);
      queryClient.invalidateQueries("projects");
    },
  });

  //Handles getting the Todos
  const getTodos = async () => {
    const response = await fetch(
      `https://hadwork.vercel.app/api/todos?projectName=${activeProject}`
    );
    return response.json();
  };
  const { data } = useQuery<TodosType[], Error>(
    ["todos", activeProject],
    getTodos,
    {
      onSuccess: (data: TodosType[]) => {},
    }
  );

  //Used to drop a TodoCard
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item: any) => moveTodoCard(item.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  //Function used to handle moving the Todocard
  function moveTodoCard(id: string) {
    const myData: any = queryClient.getQueriesData(["todos"]).flat().pop();
    const todoToMove: TodosType = myData.find(
      (todo: TodosType) => id === todo.id
    );
    todoToMove.status = title;
    editMutation.mutate(todoToMove);
  }

  // Function to handle the form submission
  const onSubmit = (formData: FormData) => {
    const newTodo: TodosType = {
      id: uuidv4(),
      task: formData.task,
      projectName: activeProject!,
      status: "todo",
    };

    addMutation.mutate(newTodo);
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
  const { ref, ...rest } = register("task", {
    required: "Task is required",
  });

  //Function to send a new todo to the backend
  const addTodo = (newTodo: TodosType) => {
    return fetch("/api/todos", {
      method: "POST",
      body: JSON.stringify(newTodo),
    });
  };

  //Update the cache
  const addMutation = useMutation(addTodo, {
    //Update the UI prior to the cache updating
    onMutate: (todoToAdd: TodosType) => {
      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData(["todos"], {
        exact: false,
      });
      // Optimistically update to the new value
      queryClient.setQueryData(["todos", activeProject], (prevTodos: any) => {
        return [...prevTodos, todoToAdd];
      });
      // Return a context object with the snapshotted value
      return { previousTodos };
    },
    //If there was an error updating the cache, rollback the data
    onError: (error, newNote: TodosType, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(
          ["todos", activeProject],
          context.previousTodos
        );
      }
    },
    //Reloads the cache with the updated todos
    onSettled: () => {
      queryClient.invalidateQueries(["todos", activeProject]);
      queryClient.invalidateQueries("projects");
      toast({
        title: "Todo created 🎉",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    },
  });

  useEffect(() => {}, [activeProject, data]);

  return (
    <Box
      ref={drop}
      flexGrow={1}
      w={"100%"}
      rounded={"10"}
      bg={"gray.200"}
      gridAutoRows={"min-content"}
    >
      <Flex p={"2"} color={"gray.700"} justifyContent={"center"}>
        <Flex flexGrow={1} justifyContent={"center"} alignItems={"baseline"}>
          {icon}
          <Text
            ps={"2"}
            color={"gray.700"}
            fontWeight={"semibold"}
            fontSize={"xl"}
          >
            {title}
          </Text>
        </Flex>
        <Flex>
          {title === "Todo" && (
            <Popover
              initialFocusRef={taskRef}
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
                      suppressHydrationWarning
                      rounded={"lg"}
                      disabled={disableButton}
                      aria-label={"Add Todo"}
                      color={"gray.700"}
                      colorScheme="white"
                      icon={<FaPlusSquare size={30} />}
                    />
                  </PopoverTrigger>
                  <PopoverContent bg={"gray.700"} p={"5"}>
                    <PopoverBody>
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <FormControl isInvalid={true}>
                          <FormErrorMessage>
                            {errors.task && errors.task.message}
                          </FormErrorMessage>
                          <Input
                            m={"2"}
                            color={"gray.100"}
                            placeholder="Enter a new task"
                            focusBorderColor="none"
                            errorBorderColor="none"
                            {...rest}
                            ref={(e) => {
                              ref(e);
                              taskRef.current = e; // you can still assign to ref
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
                          Add Task
                        </Button>
                      </form>
                    </PopoverBody>
                  </PopoverContent>
                </>
              )}
            </Popover>
          )}
        </Flex>
      </Flex>

      {data !== undefined
        ? data
            .filter((todo) => todo.status.toLowerCase() === title.toLowerCase())
            .map((todo) => (
              <TodoCard
                key={todo.id}
                id={todo.id}
                task={todo.task}
                status={todo.status}
                projectName={activeProject!}
              />
            ))
        : ""}
    </Box>
  );
};

export default ProgressBox;
