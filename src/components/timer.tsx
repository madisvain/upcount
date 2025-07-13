import { useEffect, useState } from "react";
import { Badge, Button, Space } from "antd";
import { useAtomValue } from "jotai";
import { atom } from "jotai";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { invoke } from "@tauri-apps/api/core";

import { runningTimerAtom } from "src/atoms/time-tracking";

dayjs.extend(duration);

// Dedicated atom for the timer component that fetches based on runningTimerAtom
const timerEntryAtom = atom(async (get) => {
  const runningTimerId = get(runningTimerAtom);
  if (!runningTimerId) return null;

  try {
    const timeEntry = await invoke<any>("get_time_entry", { timeEntryId: runningTimerId });
    if (!timeEntry) return null;
    return timeEntry;
  } catch (error) {
    console.error("Failed to fetch timer entry:", error);
    return null;
  }
});

const Timer = () => {
  const runningTimer = useAtomValue(runningTimerAtom);
  const timeEntry = useAtomValue(timerEntryAtom);
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
