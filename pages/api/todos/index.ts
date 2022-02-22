import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../utils/supabaseClient";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  //Get all of the todos from the database
  if (req.method === "GET") {
    const projectName = req.query.projectName;
    try {
      const { data } = await supabase
        .from("Todos")
        .select()
        .eq("projectName", projectName);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json(error);
    }
    //Add a new todo to the database
  } else if (req.method === "POST") {
    try {
      const todoToAdd = JSON.parse(req.body);
      const { data } = await supabase.from("Todos").insert(todoToAdd);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json(error);
    }
    //Update a todo
  } else if (req.method == "PUT") {
    const todoToUpdate = JSON.parse(req.body);
    try {
      const { data } = await supabase
        .from("Todos")
        .update(todoToUpdate)
        .match({ id: todoToUpdate.id });
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json(error);
    }
  } //Deletes a todo from the database
  else if (req.method == "DELETE") {
    const todoToDelete = JSON.parse(req.body);
    try {
      const { data } = await supabase
        .from("Todos")
        .delete()
        .match({ id: todoToDelete.id });
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

export default handler;
