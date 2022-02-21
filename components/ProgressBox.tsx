import React, { useRef } from "react";
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
  Spacer,
  FormErrorMessage,
  FormControl,
  useToast,
} from "@chakra-ui/react";
import { useDrop } from "react-dnd";
import TodoCard from "./TodoCard";
import {
  useQuery,
  QueryClient,
  useQueryClient,
  useMutation,
} from "react-query";
import { FaPlusSquare } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { useForm } from "react-hook-form";

const ItemTypes = {
  CARD: "card",
};

type PropTypes = {
  title: string;
  icon: any;
  todos: TodosType[];
  activeProject: string;
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

const ProgressBox = ({ title, icon, todos, activeProject }: PropTypes) => {
  const taskRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item: any) => moveTodoCard(item.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  function moveTodoCard(id: any) {
    //const todo = todosRef.current.filter((todo) => id === todo.id);
    /* if (todo.length > 0) {
      todo[0]["status"] = title;
      setTodos(() =>
        todosRef.current.filter((todo) => todo.id !== id).concat(todo[0])
      );
      fetch("/update-todo-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ todo }),
      }); 
    }*/
  }
  const getTodos = async () => {
    const response = await fetch("http://localhost:3000/api/todos");
    return response.json();
  };

  const { data } = useQuery<TodosType[], Error>("todos", getTodos);

  // Function to handle the form submission
  const onSubmit = (formData: FormData) => {
    const newTodo: TodosType = {
      id: uuidv4(),
      task: formData.task,
      projectName: activeProject,
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
  const queryClient = useQueryClient();
  const addMutation = useMutation(addTodo, {
    //Update the UI prior to the cache updating
    onMutate: (todoToAdd: TodosType) => {
      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData("todos");
      // Optimistically update to the new value
      queryClient.setQueryData("todos", (prevTodos: any) => {
        return [todoToAdd, ...prevTodos];
      });
      // Return a context object with the snapshotted value
      return { previousTodos };
    },
    //If there was an error updating the cache, rollback the data
    onError: (error, newNote: TodosType, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData("todos", context.previousTodos);
      }
    },
    //Reloads the cache with the updated todos
    onSettled: () => {
      queryClient.invalidateQueries("todos");
      queryClient.invalidateQueries("projects");
      toast({
        title: "Todo created 🎉",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    },
  });

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
                      rounded={"lg"}
                      disabled={activeProject === null || undefined}
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
                            onClose();
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

      {todos !== undefined
        ? todos
            .filter((todo) => todo.status.toLowerCase() === title.toLowerCase())
            .map((todo) => (
              <TodoCard key={todo.id} id={todo.id} task={todo.task} />
            ))
        : ""}
    </Box>
  );
};

export default ProgressBox;
