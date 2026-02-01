import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Phone, Send, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useWhatsApp } from "@/hooks/useWhatsApp";

interface WhatsAppSetupProps {
  isPro?: boolean;
}

const WhatsAppSetup = ({ isPro = false }: WhatsAppSetupProps) => {
  const [phoneNumber, setPhoneNumber] = useLocalStorage<string>("algobell-whatsapp-number", "");
  const [isEditing, setIsEditing] = useState(!phoneNumber);
  const [tempPhone, setTempPhone] = useState(phoneNumber);
  const [isVerified, setIsVerified] = useLocalStorage<boolean>("algobell-whatsapp-verified", false);
  const { sendTestMessage, isSending } = useWhatsApp();

  const handleSaveNumber = () => {
    if (tempPhone && tempPhone.length >= 10) {
      setPhoneNumber(tempPhone);
      setIsEditing(false);
    }
  };

  const handleSendTest = async () => {
    try {
      await sendTestMessage(phoneNumber);
      setIsVerified(true);
    } catch (error) {
      // Error already handled in hook
    }
  };

  if (!isPro) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-5 opacity-60"
      >
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">WhatsApp Alerts</h3>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/50 text-primary">
            PRO
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Upgrade to Pro to receive contest reminders via WhatsApp
        </p>
        <Button variant="outline" size="sm" disabled className="w-full">
          <Phone className="h-3 w-3 mr-2" />
          Unlock with Pro
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="h-4 w-4 text-green-500" />
        <h3 className="font-semibold">WhatsApp Alerts</h3>
        {isVerified && (
          <Badge className="text-[10px] px-1.5 py-0 h-4 bg-green-500/20 text-green-500 border-green-500/50">
            <Check className="h-2 w-2 mr-1" />
            Active
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Get contest reminders directly on WhatsApp
      </p>

      <div className="space-y-3">
        {isEditing ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="+1 234 567 8900"
                value={tempPhone}
                onChange={(e) => setTempPhone(e.target.value)}
                className="text-sm h-9"
              />
              <Button size="sm" onClick={handleSaveNumber} disabled={tempPhone.length < 10}>
                Save
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Include country code (e.g., +1 for US, +91 for India)
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-mono">{phoneNumber}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-7 text-xs">
                Edit
              </Button>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={handleSendTest}
              disabled={isSending}
            >
              {isSending ? (
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              ) : (
                <Send className="h-3 w-3 mr-2" />
              )}
              {isVerified ? "Send Test Message" : "Verify Number"}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WhatsAppSetup;
