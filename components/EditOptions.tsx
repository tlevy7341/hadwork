import React from "react";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { BsThreeDots } from "react-icons/bs";

const EditOptions = () => {
  return (
    <Menu autoSelect={false}>
      <MenuButton>
        <BsThreeDots />
      </MenuButton>
      <MenuList bg={"gray.700"} color={"gray.100"}>
        <MenuItem
          _hover={{ bg: "gray.600" }}
          bg={"gray.700"}
          color={"white"}
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
          color={"white"}
          onClick={() => {
            deleteMutation.mutate({ id, name, user });
          }}
        >
          Delete
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default EditOptions;
