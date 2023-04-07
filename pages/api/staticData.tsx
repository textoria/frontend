import path from 'path';
import { promises as fs } from 'fs';
import * as process from "process";
import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    //Find the absolute path of the json directory
    const jsonDirectory = path.join(process.cwd(), 'json');
    //Read the json data file data.json
    const fileContents = await fs.readFile(jsonDirectory + '/parsed_data.json', 'utf-8');
    //Return the content of the data file in json format
    res.status(200).json(fileContents);
}