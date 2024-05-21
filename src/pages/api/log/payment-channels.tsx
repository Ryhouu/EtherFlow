import type { NextApiRequest, NextApiResponse } from 'next';
import { PaymentChannelLogDataSchema } from '@/src/components/schema/PaymentChannelDataSchema';
import { supabase } from '@/src/utils/supabaseClient';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'POST') {
    const rowData: PaymentChannelLogDataSchema = req.body;
    console.log("Received payment channel log data:", rowData);
    try {
        const { data, error } = await supabase.from('payment_channels')
          .insert(rowData)

        if (error) {
          console.log("insert error", error)
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
        const { data: payment_channels } = await supabase.from("payment_channels")
          .select('*')
          .eq('account', accountValue);
    
        return res.status(200).json(
          {
            message: "Success",
            paymentChannelData: payment_channels
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
