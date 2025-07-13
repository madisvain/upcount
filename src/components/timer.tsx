import { useEffect, useState, useMemo } from "react";
import { Badge, Button, Space } from "antd";
import { useAtomValue, useSetAtom } from "jotai";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { runningTimerAtom, timeEntriesAtom, timeEntryIdAtom } from "src/atoms/time-tracking";

dayjs.extend(duration);

const Timer = () => {
  const runningTimer = useAtomValue(runningTimerAtom);
  const timeEntries = useAtomValue(timeEntriesAtom);
  const setTimeEntryId = useSetAtom(timeEntryIdAtom);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const navigate = useNavigate();

  // Get the running time entry from the entries list
  const timeEntry = useMemo(() => {
    if (!runningTimer) return null;
    return timeEntries.find(entry => entry.id === runningTimer);
  }, [runningTimer, timeEntries]);


  // Set the timeEntryId when runningTimer changes
  useEffect(() => {
    if (runningTimer) {
      setTimeEntryId(runningTimer);
    }
  }, [runningTimer, setTimeEntryId]);

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
    if (timeEntry) {
      // Navigate to time-tracking page with modal state
      navigate("/time-tracking", {
        state: {
          timeEntryModal: true,
          timeEntryId: timeEntry.id,
        },
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
          {timeEntry && timeEntry.startTime ? 
            formatDuration(Math.max(0, Math.floor((currentTime.valueOf() - (typeof timeEntry.startTime === 'number' ? timeEntry.startTime : dayjs(timeEntry.startTime).valueOf())) / 1000))) : 
            "00:00:00"}
        </span>
      </Space>
    </Button>
  );
};

export default Timer;
