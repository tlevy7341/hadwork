import React from "react";
import {
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from "@chakra-ui/react";
import { signOut } from "next-auth/react";

type PropsType = {
  email: string;
};

const MenuHeader = ({ email }: PropsType) => {
  return (
    <Flex justifyContent={"space-between"} p={"8"}>
      <Heading color={"gray.700"}>HADWORK</Heading>
      <Menu autoSelect={false}>
        <MenuButton>
          <Avatar name={email} />
        </MenuButton>
        <MenuList bg={"gray.700"} color={"gray.100"}>
          <MenuItem
            _hover={{ bg: "gray.600" }}
            onClick={() => {
              signOut();
            }}
          >
            Log Out
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default MenuHeader;
