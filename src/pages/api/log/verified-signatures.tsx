import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/src/utils/supabaseClient';
import { VerifiedSignatureLogDataSchema } from '@/src/components/schema/PaymentSignatureDataSchema';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'POST') {
    const rowData: VerifiedSignatureLogDataSchema = req.body;
    console.log("Received verified siganture log data:", rowData);
    try {
        const { data, error } = await supabase.from('verified_signatures')
          .insert(rowData)

        if (error) {
          console.log("Insert error", error)
          return res.status(400).json({ message: "Bad Request" })
        }
        return res.status(200).json({ message: "Success" })
    } catch (error) {
        console.error("Error in POST function:", error);
        return res.status(500).json({ message: "Internal Server Error" })
    }
  } else if (req.method === 'GET') {
    const account = req.query.account;
    const accountValue = Array.isArray(account) ? account[0] : account;
    console.log("Received account query:", accountValue);
    try {
        const { data: verified_signatures } = await supabase.from("verified_signatures")
          .select('*')
          .eq('account', accountValue);
    
        return res.status(200).json(
          {
            message: "Success",
            verifiedSignatureData: verified_signatures
          }
        )
      } catch (error) {
        console.error("Error in GET function:", error);
        return res.status(500).json({ message: "Internal Server Error" })
      }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
