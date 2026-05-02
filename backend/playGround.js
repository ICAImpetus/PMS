// const state = {
//     myFeature: {},
//     myActivation: {
//         data: [],
//         loading: false,
//         error: null
//     },
//     myApiDetail: {
//         message: 'Data received and sent successfully!',
//         result: [
//             {
//                 adminuser: 'surya',
//                 ApiPayload: {
//                     sdfsaf: 'Direction',
//                     sdfasdf: 'EndTime',
//                     sdfsd: 'sdfsd'
//                 },
//                 Active: true,
//                 ApiTime: 'AgentPopUp',
//                 ApiType: 'POST',
//                 ApiURL: 'http://172.17.0.4:3000/webhook'
//             },
//             {
//                 adminuser: 'surya',
//                 ApiPayload: {
//                     number: 'DestinationNumber',
//                     name: 'CallerName',
//                     leadsource: 'IVR'
//                 },
//                 Active: true,
//                 ApiTime: 'CallStart',
//                 ApiType: 'POST',
//                 ApiURL: 'http://172.17.0.4:3000/webhook'
//             }
//         ]
//     },
//     myUsersDetail: {
//         loading: false,
//         message: 'Data received and sent successfully!',
//         result: [
//             {
//                 adminuser: 'surya',
//                 userid: 'alotiki@surya',
//                 username: 'alotiki',
//                 campaign: 77,
//                 number: '7023236685',
//                 priority: 90,
//                 Active: 'true'
//             },
//             {
//                 adminuser: 'surya',
//                 userid: 'test1@surya',
//                 username: 'test1',
//                 campaign: 77,
//                 number: '7023236685',
//                 priority: 100,
//                 Active: 'true'
//             },
//             {
//                 adminuser: 'surya',
//                 userid: 'test2@surya',
//                 username: 'test2',
//                 campaign: 77,
//                 Active: 'true',
//                 number: '7023236685',
//                 priority: 100
//             },
//             {
//                 adminuser: 'surya',
//                 userid: 'test3@surya',
//                 username: 'test3',
//                 campaign: 77,
//                 Active: 'true',
//                 number: '7023236685',
//                 priority: 100
//             },
//             {
//                 adminuser: 'surya',
//                 userid: '1@surya',
//                 username: 'shyam',
//                 campaign: 79,
//                 Active: 'true',
//                 number: '7023236685',
//                 priority: 100
//             },
//             {
//                 adminuser: 'surya',
//                 userid: 'lokesh@surya',
//                 username: 'Lokesh',
//                 campaign: 79,
//                 Active: 'true',
//                 number: '8875242421',
//                 priority: 100
//             },
//             {
//                 adminuser: 'surya',
//                 userid: 'demo@surya',
//                 username: 'Demo user',
//                 campaign: 77,
//                 Active: 'true',
//                 number: '7023236685',
//                 priority: 100
//             },
//             {
//                 adminuser: 'surya',
//                 userid: 'alpha@surya',
//                 username: 'Alpha ',
//                 campaign: 79,
//                 number: '7240041352',
//                 priority: 100,
//                 Active: 'true'
//             },
//             {
//                 adminuser: 'surya',
//                 userid: 'user1@surya',
//                 username: 'user',
//                 campaign: 77,
//                 Number: '',
//                 priority: 100,
//                 Active: 'true'
//             },
//             {
//                 adminuser: 'surya',
//                 userid: 'harsh@surya',
//                 username: 'harhsh',
//                 campaign: 77,
//                 Number: '',
//                 priority: 100,
//                 number: '7240041352',
//                 Active: 'true'
//             },
//             {
//                 adminuser: 'surya',
//                 userid: 'yash@surya',
//                 username: 'khande',
//                 campaign: 79,
//                 Number: '9588081874',
//                 priority: 100,
//                 Active: 'true'
//             }
//         ],
//         success: true
//     },
//     myUsersLiveDetail: {
//         message: 'Data received and sent successfully!',
//         result: [
//             {
//                 user: 'demo@surya',
//                 Time: 1731559330662,
//                 Status: 'UNAVAILABLE',
//                 campaign: 77,
//                 adminuser: 'surya',
//                 Type: 'asterisk'
//             },
//             {
//                 user: 'alpha@surya',
//                 Time: 1731482863868,
//                 Status: 'UNAVAILABLE',
//                 campaign: 77,
//                 adminuser: 'surya',
//                 Type: 'asterisk'
//             }
//         ],
//         calldata: [
//             {
//                 hangupcause: 'Hangup after transfer to agent',
//                 hanguptime: 1731498404983,
//                 agent: 'demo@surya',
//                 startTime: 1731498384125,
//                 bridgeID: '4cd2b992-0dc0-4b01-96c1-b1beae6cd1ce',
//                 Type: 'manualoutgoing',
//                 Caller: '7240041352',
//                 adminuser: 'surya',
//                 anstime: null,
//                 campaign: 77,
//                 leadID: 'NA',
//                 campaignCLI: 'undefined',
//                 dialTimeOut: '25',
//                 holdArray: [],
//                 channelID: 1731498384.341,
//                 Disposition: 'Interested'
//             },
//             {
//                 hanguptime: 1731499683488,
//                 hangupcause: 'Hangup after transfer to agent',
//                 agent: 'demo@surya',
//                 startTime: 1731499682029,
//                 bridgeID: '2ef9c32c-1f49-4aff-aec4-dc5db5a2a765',
//                 Type: 'manualoutgoing',
//                 Caller: '7240041352',
//                 adminuser: 'surya',
//                 anstime: null,
//                 campaign: 77,
//                 leadID: 'NA',
//                 campaignCLI: 'undefined',
//                 dialTimeOut: '25',
//                 holdArray: [],
//                 channelID: 1731499682.346,
//                 Disposition: 'Interested'
//             },
//             {
//                 hangupcause: 'Hangup after transfer to agent',
//                 hanguptime: 1731499708814,
//                 agent: 'demo@surya',
//                 startTime: 1731499689622,
//                 bridgeID: '73d8d97a-891e-40de-8688-37a91f829308',
//                 Type: 'manualoutgoing',
//                 Caller: '7240041352',
//                 adminuser: 'surya',
//                 anstime: null,
//                 campaign: 77,
//                 leadID: 'NA',
//                 campaignCLI: 'undefined',
//                 dialTimeOut: '25',
//                 holdArray: [],
//                 channelID: 1731499689.351
//             },
//             {
//                 hangupcause: 'Hangup after transfer to agent',
//                 hanguptime: 1731499857244,
//                 agent: 'demo@surya',
//                 startTime: 1731499831585,
//                 bridgeID: 'f03b32f5-d086-4225-8481-58a93692e3ca',
//                 Type: 'manualoutgoing',
//                 Caller: '7240041352',
//                 adminuser: 'surya',
//                 anstime: null,
//                 campaign: 77,
//                 leadID: 'NA',
//                 campaignCLI: 'undefined',
//                 dialTimeOut: '25',
//                 holdArray: [],
//                 channelID: 1731499831.36,
//                 Disposition: 'Interested'
//             }
//         ],
//         admincallqueue: [],
//         adminongoingCalls: [],
//         admindialingCalls: []
//     },
//     myCombinedCampaigns: {
//         data: [
//             {
//                 adminuser: 'surya',
//                 campaignname: 'offlinecampaign',
//                 campaignID: 79,
//                 campaigndes: 'offline campaign',
//                 transferLogic: 'Priority',
//                 waitsoundid: 'surya@hanuman.wav'
//             },
//             {
//                 adminuser: 'surya',
//                 campaignname: 'rishi',
//                 campaignID: 77,
//                 campaigndes: 'rishi\'s campaign ',
//                 active: 'No',
//                 CallRatio: '0',
//                 waitsoundid: 'englishWait.wav',
//                 holdsoundid: 'surya@hanuman.wav',
//                 CampaignCLI: 'undefined',
//                 dialTimeOut: '25'
//             }
//         ],
//         campaignsData: [
//             {
//                 adminuser: 'surya',
//                 campaignname: 'rishi',
//                 campaignID: 77,
//                 campaigndes: 'rishi\'s campaign ',
//                 active: 'No',
//                 CallRatio: '0',
//                 waitsoundid: 'englishWait.wav',
//                 holdsoundid: 'surya@hanuman.wav',
//                 CampaignCLI: 'undefined',
//                 dialTimeOut: '25'
//             }
//         ],
//         OffcampaignsData: [
//             {
//                 adminuser: 'surya',
//                 campaignname: 'offlinecampaign',
//                 campaignID: 79,
//                 campaigndes: 'offline campaign',
//                 transferLogic: 'Priority',
//                 waitsoundid: 'surya@hanuman.wav'
//             }
//         ],
//         loading: false,
//         error: null
//     }
// }

async function campaigncall(incomingchannel, CallData, campfound, adminuser) {
  const campcalldata = { ...CallData, campaign: campfound };

  // Firebase Notification
  const tokens = getFirbaseAppTokens().filter((t) => t.adminuser === adminuser);
  if (tokens.length > 0) {
    console.log("Sending Firebase Notification...");
    Promise.allSettled(
      tokens.map((token) =>
        sendNotification(token.token, "incoming call", `${CallData.Caller}`)
      )
    )
      .then((results) => console.log("Notifications settled:", results))
      .catch((err) => console.log("Error in notification:", err));
  }

  const foundcampaign = Campaign.find((c) => c.campaignID == campfound);
  Object.assign(campcalldata, {
    queueDropAction: foundcampaign?.queueDropAction,
    queueDropTime: foundcampaign?.queueDropTime,
    queueDropID: foundcampaign?.queueDropID,
  });

  const queueDropObject = {
    queueName: "campaign",
    ID: campfound,
    queueStartTime: Date.now(),
  };

  const campaignAgents = liveuser.filter(
    (agent) => agent.campaign == campfound
  );
  const isAlreadyInCampQue =
    campcalldata.queueDetail?.at(-1)?.queueName === "campaign" &&
    campcalldata.queueDetail?.at(-1)?.ID === campfound;

  const playWaitSound = () => {
    const sound = foundcampaign?.waitsoundid
      ? `sound:${foundcampaign.waitsoundid}`
      : "sound:englishWait";
    playsound(ari, incomingchannel, sound, () =>
      Replay(incomingchannel, sound, "campaign")
    );
  };

  const updateOngoingCalls = (updates) => {
    ongoingCalls = ongoingCalls.filter(
      (c) => c.channelID != incomingchannel.id
    );
    ongoingCalls.push({
      ...(ongoingCalls.find((c) => c.channelID == incomingchannel.id) || {}),
      ...updates,
    });
  };

  if (
    campaignAgents.length === 0 ||
    (CallData.isSticky &&
      !campaignAgents.find((x) => x.user === CallData.stickyAgent))
  ) {
    playWaitSound();
    if (foundcampaign?.queueDropAction && !isAlreadyInCampQue)
      campcalldata.queueDetail.push(queueDropObject);
    callqueue.push(campcalldata);
    justAnsweredCalls = justAnsweredCalls.filter(
      (c) => c.channelId != incomingchannel.id
    );
    updateOngoingCalls({
      campaign: campfound,
      playbackstarted: foundcampaign?.waitsoundid,
      playbackstarttime: Date.now(),
    });
  } else {
    const agent = CallData.isSticky
      ? campaignAgents.find((x) => x.user === CallData.stickyAgent)?.user
      : campaignAgents[0]?.user;
    if (agent) {
      handleincomingCall(incomingchannel, agent, adminuser, campfound);
    } else {
      playWaitSound();
      if (foundcampaign?.queueDropAction && !isAlreadyInCampQue)
        campcalldata.queueDetail.push(queueDropObject);
      callqueue.push(campcalldata);
      justAnsweredCalls = justAnsweredCalls.filter(
        (c) => c.channelId != incomingchannel.id
      );
      updateOngoingCalls({
        campaign: campfound,
        playbackstarted: foundcampaign?.waitsoundid,
        playbackstarttime: Date.now(),
      });
    }
  }
}

const seriesId = "242330bf-d2c15397-62dfe762-3540637a-9950d705"; // Replace with your Series ID

async function getInstances(seriesId) {
  const response = await fetch(`http://localhost:8042/series/${seriesId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch series: ${response.status}`);
  }
  const data = await response.json();
  return data.Instances || [];
}

async function createArchive(instanceIds, chunkIndex) {
  const archiveBody = {
    Asynchronous: false,
    Synchronous: true,
    Filename: `archive-chunk-${chunkIndex + 1}.zip`,
    LossyQuality: 0,
    Priority: 0,
    Resources: instanceIds,
  };

  const response = await fetch("http://localhost:8042/tools/create-archive", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(archiveBody),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create archive: ${response.status}\n${errText}`);
  }

  const buffer = await response.arrayBuffer();
  const fs = require("fs");
  const path = require("path");

  const filePath = path.join(__dirname, `archive-chunk-${chunkIndex + 1}.zip`);
  fs.writeFileSync(filePath, Buffer.from(buffer));
  console.log(` Saved: ${filePath}`);
}

async function process() {
  try {
    const instances = await getInstances(seriesId);
    console.log("📦 Found instances:", instances.length);

    const chunkSize = 10;
    for (let i = 0; i < instances.length; i += chunkSize) {
      const chunk = instances.slice(i, i + chunkSize);
      console.log(`➡️ Creating archive for chunk ${i / chunkSize + 1}`);
      await createArchive(chunk, i / chunkSize);
    }

    console.log(" All chunks processed.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

process();
