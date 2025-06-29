import { useEffect, useState } from "react";
import { Badge, Button, Space } from "antd";
import { useAtomValue, useSetAtom } from "jotai";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { runningTimerAtom, timeEntriesAtom, timeEntryIdAtom } from "src/atoms";

dayjs.extend(duration);

const Timer = () => {
  const runningTimer = useAtomValue(runningTimerAtom);
  const timeEntries = useAtomValue(timeEntriesAtom);
  const setTimeEntryId = useSetAtom(timeEntryIdAtom);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const navigate = useNavigate();

  // Update current time every second for running timer
  useEffect(() => {
    if (runningTimer) {
      const interval = setInterval(() => {
        setCurrentTime(dayjs());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [runningTimer]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const d = dayjs.duration(seconds, "seconds");
    const hours = Math.floor(d.asHours());
    const minutes = d.minutes();
    const secs = d.seconds();
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!runningTimer) {
    return null;
  }

  const handleClick = () => {
    // Find the running timer entry
    const runningEntry = timeEntries.find((entry) => entry.startTime === parseInt(runningTimer) && !entry.endTime);
    
    if (runningEntry) {
      // Set the time entry ID to open the modal
      setTimeEntryId(runningEntry.id);
      // Navigate to time-tracking page with modal state
      navigate("/time-tracking", { 
        state: { 
          timeEntryModal: true, 
          timeEntryId: runningEntry.id 
        } 
      });
    } else {
      // Fallback to just navigate to time-tracking page
      navigate("/time-tracking");
    }
  };

  return (
    <Button type="default" onClick={handleClick}>
      <Space>
        <Badge status="processing" color="red" />
        <span style={{ fontWeight: "bold", fontFamily: "monospace" }}>
          {formatDuration(Math.max(0, Math.floor((currentTime.valueOf() - parseInt(runningTimer)) / 1000)))}
        </span>
      </Space>
    </Button>
  );
};

export default Timer;
