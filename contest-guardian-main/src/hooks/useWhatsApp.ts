import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SendWhatsAppParams {
  to: string;
  contestName: string;
  platform: string;
  timeUntil: string;
}

export const useWhatsApp = () => {
  const [isSending, setIsSending] = useState(false);

  const sendWhatsAppReminder = async ({
    to,
    contestName,
    platform,
    timeUntil,
  }: SendWhatsAppParams) => {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-whatsapp", {
        body: { to, contestName, platform, timeUntil },
      });

      if (error) throw error;

      toast({
        title: "WhatsApp Sent! 📱",
        description: `Reminder sent for ${contestName}`,
      });

      return data;
    } catch (error: any) {
      console.error("WhatsApp error:", error);
      toast({
        title: "Failed to send WhatsApp",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  const sendTestMessage = async (phoneNumber: string) => {
    return sendWhatsAppReminder({
      to: phoneNumber,
      contestName: "Test Contest",
      platform: "AlgoBell",
      timeUntil: "Starting in 30 minutes",
    });
  };

  return {
    sendWhatsAppReminder,
    sendTestMessage,
    isSending,
  };
};
