import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { supabase } from "../../../utils/supabaseClient";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  //Get all of the projects from the database
  if (req.method === "GET") {
    try {
      const session = await getSession({ req });
      const email: string = session!.user!.email!;
      const { data, error } = await supabase
        .from("Projects")
        .select(
          `
    *,
    Todos (
      *
    )
  `
        )
        .eq("user", email)
        .order("name");
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json(error);
    }
    //Add a new project to the database
  } else if (req.method === "POST") {
    try {
      const projectToAdd = JSON.parse(req.body);
      const { data, error } = await supabase
        .from("Projects")
        .insert(projectToAdd);

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json(error);
    }
  } else if (req.method == "PUT") {
    const projecToUpdate = JSON.parse(req.body);
    try {
      const { data, error } = await supabase
        .from("Projects")
        .update({ name: projecToUpdate.name })
        .match({ id: projecToUpdate.id });
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json(error);
    }
  } //Deletes a project from the database
  else if (req.method == "DELETE") {
    const projectToDelete = JSON.parse(req.body);
    try {
      const { data, error } = await supabase
        .from("Projects")
        .delete()
        .match({ id: projectToDelete.id });
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

export default handler;
