import type { Asset } from "@/types/api.types";
import type { Position } from "@/types/player.types";
import type { Database, StoredGoal, StoredPlayer } from "@/mocks/store";

const NAMES = [
  "Amal Nair",
  "Vishnu Menon",
  "Arjun Kumar",
  "Faisal Rahman",
  "Jishnu Das",
  "Akhil Joseph",
  "Sreejith Pillai",
  "Midhun Varma",
  "Adarsh Khan",
  "Basil Thomas",
  "Farhan George",
  "Harish Ibrahim",
  "Ijas Reddy",
  "Jithin Shah",
  "Kiran Babu",
  "Lijo Krishnan",
  "Manoj Ali",
  "Nikhil John",
  "Pranav Mathew",
  "Riyas Hussain",
  "Sabir Nair",
  "Tony Menon",
  "Unni Kumar",
  "Vineeth Rahman",
  "Yadu Das",
  "Abhijith Joseph",
  "Deepak Pillai",
  "Ebin Varma",
  "Gokul Khan",
  "Hisham Thomas",
  "Irfan George",
  "Jaseem Ibrahim",
  "Kabeer Reddy",
  "Libin Shah",
  "Mathew Babu",
  "Naveen Krishnan",
  "Prajith Ali",
  "Ranjith John",
  "Shyam Mathew",
  "Thomas Hussain",
  "Ubaid Nair",
  "Varun Menon",
  "Yaseen Kumar",
  "Anand Rahman",
  "Nithin Das",
  "Rahul Joseph",
  "Christo Pillai",
  "Wahid Varma",
  "Zayan Khan",
  "Ouseph Thomas",
  "Bibin George",
  "Sandeep Ibrahim",
  "Afsal Reddy",
  "Dhanush Shah",
  "Eldho Babu",
  "Fahad Krishnan",
];

const ROLES: Position[] = ["GK", "DF", "DF", "DF", "MF", "MF", "MF", "FW", "FW"];
const JERSEYS = [1, 2, 4, 5, 6, 8, 10, 9, 11];
const PRICES = [1400, 900, 820, 740, 1050, 960, 840, 1000, 1900];
const TWEAK = [0, -40, -80, 60, -120, -70];
const FULL = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const SHORT = [0, 1, 2, 4, 5, 7, 8];

const TEAMS = [
  { id: "team-cs", name: "Cheruppa Stars", short: "CS", group: "Group A", kit: "#b43346" },
  { id: "team-mu", name: "Malabar United", short: "MU", group: "Group A", kit: "#2a62d0" },
  { id: "team-kr", name: "Kozhikode Rangers", short: "KR", group: "Group A", kit: "#d4841a" },
  { id: "team-ck", name: "Calicut Kings", short: "CK", group: "Group B", kit: "#6d4ca8" },
  { id: "team-gv", name: "Green Valley FC", short: "GV", group: "Group B", kit: "#1c8a4d" },
  { id: "team-ra", name: "Riverside Athletic", short: "RA", group: "Group B", kit: "#147e86" },
];

function crest(short: string, kit: string): Asset {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="${kit}"/><circle cx="40" cy="40" r="22" fill="none" stroke="#f4f7f2" stroke-width="3"/><path d="M40 22l4 8h8l-6 5 2 8-8-5-8 5 2-8-6-5h8z" fill="#f4f7f2"/><text x="40" y="62" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#f4f7f2">${short}</text></svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    publicId: `crest-${short.toLowerCase()}`,
  };
}

function portrait(name: string, kit: string, id: string): Asset {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="${kit}"/><circle cx="40" cy="32" r="14" fill="#f4f7f2" opacity="0.9"/><path d="M16 74c4-14 14-20 24-20s20 6 24 20" fill="#f4f7f2" opacity="0.9"/><text x="40" y="14" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" font-weight="700" fill="#f4f7f2">${initials}</text></svg>`;
  return { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`, publicId: `pic-${id}` };
}

function goal(
  id: string,
  scoringTeamRef: string,
  goalType: "normal" | "own_goal",
  scorerRef: string | null,
  ownGoalPlayerRef: string | null,
): StoredGoal {
  return {
    _id: id,
    scoringTeamRef,
    goalType,
    scorerRef,
    ownGoalPlayerRef,
    createdAt: "2026-11-02T12:00:00.000Z",
  };
}

export function createSeed(): Database {
  const now = "2026-10-20T10:00:00.000Z";
  const teams = TEAMS.map((team) => ({
    _id: team.id,
    name: team.name,
    shortName: team.short,
    logo: crest(team.short, team.kit),
    poster: null,
    groupName: team.group,
    status: "active" as const,
    createdAt: now,
    updatedAt: now,
  }));

  const players: StoredPlayer[] = [];
  let cursor = 0;
  TEAMS.forEach((team, teamIndex) => {
    const slots = teamIndex < 4 ? FULL : SHORT;
    for (const roleIndex of slots) {
      const name = NAMES[cursor];
      cursor += 1;
      const id = `${team.id}-p${roleIndex}`;
      players.push({
        _id: id,
        name,
        mobile: `9847${String(100000 + cursor).slice(-6)}`,
        email: null,
        dateOfBirth: null,
        position: ROLES[roleIndex],
        isIconPlayer: roleIndex === 8,
        teamRef: team.id,
        jerseyNo: JERSEYS[roleIndex],
        auctionPrice: PRICES[roleIndex] + TWEAK[teamIndex],
        auctionStatus: "sold",
        status: "active",
        profilePic: portrait(name, team.kit, id),
      });
    }
  });

  const pool = [
    { auctionStatus: "unsold" as const, status: "active" as const },
    { auctionStatus: "unsold" as const, status: "active" as const },
    { auctionStatus: "pending" as const, status: "active" as const },
    { auctionStatus: "pending" as const, status: "active" as const },
    { auctionStatus: "pending" as const, status: "inactive" as const },
    { auctionStatus: "pending" as const, status: "inactive" as const },
  ];
  pool.forEach((entry, index) => {
    const name = NAMES[cursor];
    cursor += 1;
    const id = `player-pool-${index + 1}`;
    players.push({
      _id: id,
      name,
      mobile: `9847${String(200000 + cursor).slice(-6)}`,
      email: index === 0 ? "bibin.george@example.com" : null,
      dateOfBirth: index === 5 ? "1998-04-12" : null,
      position: index % 2 === 0 ? "MF" : "DF",
      isIconPlayer: false,
      teamRef: null,
      jerseyNo: null,
      auctionPrice: 0,
      auctionStatus: entry.auctionStatus,
      status: entry.status,
      profilePic: portrait(name, "#0e3b2e", id),
    });
  });

  const managerNames = [
    ["Suresh Menon", "team-cs", "Manager"],
    ["Anwar Rahman", "team-mu", "Manager"],
    ["Biju Thomas", "team-kr", "Manager"],
    ["Shahid Khan", "team-ck", "Manager"],
    ["Reji George", "team-gv", "Assistant Manager"],
    ["Nazar Ali", "team-ra", "Manager"],
  ] as const;

  const sponsors = [
    ["Malabar Traders", "Title sponsor", "https://example.com"],
    ["GreenLeaf Sports", "Gold", "https://example.com"],
    ["Harbour Kitchen", "Silver", null],
    ["River Boats", "Community", null],
  ] as const;

  return {
    settings: {
      _id: "settings-current",
      singletonKey: "CSL_CURRENT",
      tournamentName: "CSL Football Tournament 2026",
      startDate: "2026-11-02",
      endDate: "2026-11-18",
      maxActivePlayers: 54,
      maxActiveTeams: 6,
      maxPlayersPerTeam: 9,
      auctionBudgetPerTeam: 10000,
      requiredIconPlayers: 1,
      requiredGoalkeepers: 1,
      pointsRule: { win: 3, draw: 1, loss: 0 },
      updatedAt: "2026-11-01T08:00:00.000Z",
    },
    user: {
      _id: "user-admin",
      name: "CSL Administrator",
      email: "admin@csl.local",
      role: "admin",
      status: "active",
    },
    teams,
    players,
    managers: managerNames.map(([name, teamRef, role], index) => ({
      _id: `manager-${index + 1}`,
      name,
      mobile: `9895${String(300000 + index).slice(-6)}`,
      email: null,
      dateOfBirth: null,
      teamRef,
      role,
      profilePic: portrait(name, TEAMS[index].kit, `manager-${index + 1}`),
      status: "active" as const,
    })),
    sponsors: sponsors.map(([name, tier, website], index) => ({
      _id: `sponsor-${index + 1}`,
      name,
      logo: crest(name.slice(0, 2).toUpperCase(), index === 0 ? "#e2b15a" : "#14915c"),
      tier,
      website,
      contactPerson: index === 0 ? "Leena Das" : null,
      contactMobile: index === 0 ? "9847001122" : null,
      notes: index === 0 ? "Banner placement on the home page." : null,
      status: "active" as const,
    })),
    matches: [
      match("match-m01", "M01", "group", "Group A", "2026-11-02T16:30:00+05:30", "Cheruppa Ground", "team-cs", "team-mu", "completed", [
        goal("g-m01-1", "team-cs", "normal", "team-cs-p8", null),
        goal("g-m01-2", "team-cs", "normal", "team-cs-p8", null),
        goal("g-m01-3", "team-mu", "normal", "team-mu-p7", null),
      ]),
      match("match-m02", "M02", "group", "Group A", "2026-11-04T16:30:00+05:30", "Cheruppa Ground", "team-cs", "team-kr", "completed", [
        goal("g-m02-1", "team-cs", "normal", "team-cs-p8", null),
        goal("g-m02-2", "team-kr", "normal", "team-kr-p8", null),
      ]),
      match("match-m03", "M03", "group", "Group A", "2026-11-06T16:30:00+05:30", "Malabar Stadium", "team-mu", "team-kr", "completed", [
        goal("g-m03-1", "team-mu", "normal", "team-mu-p8", null),
        goal("g-m03-2", "team-mu", "normal", "team-mu-p8", null),
        goal("g-m03-3", "team-mu", "normal", "team-mu-p7", null),
        goal("g-m03-4", "team-mu", "own_goal", null, "team-kr-p2"),
        goal("g-m03-5", "team-kr", "normal", "team-kr-p7", null),
        goal("g-m03-6", "team-kr", "normal", "team-kr-p5", null),
      ]),
      match("match-m04", "M04", "group", "Group B", "2026-11-03T18:00:00+05:30", "Malabar Stadium", "team-ck", "team-gv", "completed", [
        goal("g-m04-1", "team-ck", "normal", "team-ck-p8", null),
        goal("g-m04-2", "team-ck", "normal", "team-ck-p8", null),
      ]),
      match("match-m05", "M05", "group", "Group B", "2026-11-08T16:30:00+05:30", "Riverside Pitch", "team-ck", "team-ra", "completed", [
        goal("g-m05-1", "team-ck", "normal", "team-ck-p8", null),
      ]),
      match("match-m06", "M06", "group", "Group B", "2026-11-11T18:30:00+05:30", "Riverside Pitch", "team-gv", "team-ra", "live", [
        goal("g-m06-1", "team-gv", "normal", "team-gv-p8", null),
        goal("g-m06-2", "team-ra", "normal", "team-ra-p8", null),
      ]),
      {
        ...match("match-m07", "M07", "semi_final", null, "2026-11-10T19:00:00+05:30", "Malabar Stadium", "team-cs", "team-ck", "completed", [
          goal("g-m07-1", "team-cs", "normal", "team-cs-p8", null),
          goal("g-m07-2", "team-ck", "normal", "team-ck-p5", null),
        ]),
        penaltyShootout: { team1Score: 4, team2Score: 3 },
        notes: "Level after normal time. Cheruppa Stars won the shootout.",
      },
      match("match-m08", "M08", "semi_final", null, "2026-11-14T16:30:00+05:30", "Malabar Stadium", "team-mu", "team-gv", "scheduled", [], "Second semi-final."),
      match("match-m09", "M09", "final", null, "2026-11-18T19:00:00+05:30", "Cheruppa Ground", "team-cs", "team-mu", "scheduled", [], "Provisional final. Change the teams after the remaining semi-final."),
      match("match-m10", "M10", "quarter_final", null, "2026-11-15T16:00:00+05:30", "Cheruppa Ground", "team-cs", "team-gv", "postponed", [], "Reserve fixture, postponed."),
      match("match-m11", "M11", "quarter_final", null, "2026-11-15T18:00:00+05:30", "Riverside Pitch", "team-mu", "team-ra", "cancelled", [], "Reserve fixture, cancelled."),
    ],
  };
}

function match(
  id: string,
  matchNo: string,
  stage: Database["matches"][number]["stage"],
  groupName: string | null,
  kickoffAt: string,
  venue: string,
  team1Ref: string,
  team2Ref: string,
  status: Database["matches"][number]["status"],
  goals: StoredGoal[],
  notes: string | null = null,
): Database["matches"][number] {
  return {
    _id: id,
    matchNo,
    stage,
    groupName,
    kickoffAt,
    venue,
    team1Ref,
    team2Ref,
    status,
    goals,
    penaltyShootout: null,
    notes,
    createdAt: "2026-10-28T08:00:00.000Z",
    updatedAt: "2026-11-10T12:00:00.000Z",
  };
}
