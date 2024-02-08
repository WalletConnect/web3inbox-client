import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic'
import './DevTimeStamp.module.css'
import {
  Box,
  Text,
} from "@chakra-ui/react";

const getTimeStampFormatted = (rawTimestamp: number) => {

  const timestamp = new Date(rawTimestamp)

  const year = timestamp.getFullYear();

  // Months are zero-indexed
  const month = (timestamp.getMonth() + 1).toString().padStart(2, '0'); 
  const day = timestamp.getDate().toString().padStart(2, '0');
  const hours = timestamp.getHours().toString().padStart(2, '0');
  const minutes = timestamp.getMinutes().toString().padStart(2, '0');
  const seconds = timestamp.getSeconds().toString().padStart(2, '0');
  
  const timeZone = new Intl.DateTimeFormat('en', { timeZoneName: 'short' }).formatToParts(timestamp).find(part => part.type === 'timeZoneName')!.value;

  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${timeZone}`;

  return formattedDateTime

}

const DevTimeStamp = () => {
  const [timestamp, setTimestamp] = useState(Date.now())

  useEffect(() => {
     const intervalId = setInterval(() => {
      setTimestamp(Date.now())
     }, 250)

     return () => clearInterval(intervalId)
  }, [setTimestamp])

  return (
    <Box className="DevTimeStamp">
      <Text>{getTimeStampFormatted(timestamp)}</Text>
    </Box>
  )
}

export default dynamic(() => Promise.resolve(DevTimeStamp));
