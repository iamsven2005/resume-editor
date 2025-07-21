"use client"
import React, { useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
interface Props{
    url: string
}
const ClipboardLink = ({ url }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      toast.success("Copied link")
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset the copied state after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <Button onClick={handleCopy} variant={"link"}>
      {copied ? 'Copied!' : 'Copy Link'}
    </Button>
  );
};

export default ClipboardLink;
