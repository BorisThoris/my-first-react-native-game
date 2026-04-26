import { writeFileSync } from 'node:fs';

const phaseByReg = new Map([
  [0, 1], [24, 1], [33, 1], [40, 1], [52, 1], [63, 1], [68, 1], [87, 1], [88, 1], [89, 1],
  [15, 2], [17, 2], [18, 2], [19, 2], [20, 2], [21, 2], [22, 2], [25, 2],
  [45, 2], [46, 2], [47, 2], [48, 2], [49, 2], [50, 2], [65, 2], [66, 2],
  [69, 2], [70, 2], [71, 2], [72, 2], [73, 2], [74, 2], [75, 2], [76, 2], [77, 2], [78, 2], [79, 2],
  [80, 2], [81, 2], [82, 2], [83, 2], [84, 2], [85, 2], [86, 2],
  [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [14, 3], [16, 3], [23, 3],
  [26, 3], [28, 3], [32, 3], [34, 3], [35, 3], [36, 3], [44, 3],
  [10, 4], [11, 4], [12, 4], [13, 4], [37, 4], [38, 4], [51, 4], [53, 4], [54, 4], [55, 4], [59, 4],
  [64, 4], [67, 4], [90, 4], [91, 4], [92, 4], [93, 4], [94, 4], [95, 4], [96, 4], [97, 4], [98, 4],
  [99, 4], [100, 4], [101, 4], [102, 4], [103, 4], [104, 4], [105, 4], [106, 4], [107, 4], [108, 4],
  [113, 4], [114, 4],
  [27, 5], [29, 5], [30, 5], [31, 5], [39, 5], [41, 5], [42, 5], [43, 5], [56, 5], [57, 5], [58, 5],
  [62, 5], [109, 5], [110, 5], [111, 5], [112, 5],
  ...Array.from({ length: 41 }, (_, i) => [120 + i, 6]).filter(([reg]) => reg !== 129),
  [60, 7], [61, 7], [115, 7], [116, 7], [117, 7], [118, 7], [119, 7], [129, 7]
]);

const trackA = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 14, 28, 34, 44]);
const trackB = new Set([16, 23, 26, 32, 35, 36]);
const gateDepsForPhase2 = [68, 87, 88, 89];

const dependenciesFor = (reg, phase) => {
  if (reg === 33) return [];
  if ([68, 87, 88, 89].includes(reg)) return [33];
  if (reg === 52) return [33, 68];
  if ([24, 40, 63].includes(reg)) return [33, 68, 89];
  if (phase === 2) return gateDepsForPhase2;
  if (phase === 3) return [68, 87, 88, 89];
  if (phase === 4) return [1, 6, 7, 8, 9, 14, 28, 44];
  if (phase === 5) return [90, 99, 102, 104, 108];
  if (phase === 6) return [27, 29, 31, 62, 109, 110, 111, 112];
  if (phase === 7) return [115, 117, 118];
  return [33];
};

const statusOverrides = new Map([
  [1, 'done'],
  [2, 'done'],
  [3, 'done'],
  [4, 'done'],
  [5, 'done'],
  [6, 'done'],
  [7, 'done'],
  [8, 'done'],
  [9, 'done'],
  [14, 'done'],
  [28, 'done'],
  [34, 'done'],
  [44, 'done'],
  [16, 'done'],
  [23, 'done'],
  [26, 'done'],
  [32, 'done'],
  [35, 'done'],
  [36, 'done'],
  [10, 'done'],
  [11, 'done'],
  [12, 'done'],
  [13, 'done'],
  [37, 'done'],
  [38, 'done'],
  [51, 'done'],
  [53, 'done'],
  [54, 'done'],
  [55, 'done'],
  [59, 'done'],
  [64, 'done'],
  [67, 'done'],
  [90, 'done'],
  [91, 'done'],
  [92, 'done'],
  [93, 'done'],
  [94, 'done'],
  [95, 'done'],
  [96, 'done'],
  [97, 'done'],
  [15, 'done'],
  [18, 'done'],
  [19, 'done'],
  [20, 'done'],
  [21, 'done'],
  [22, 'done'],
  [25, 'done'],
  [46, 'done'],
  [47, 'done'],
  [48, 'done'],
  [49, 'done'],
  [50, 'done'],
  [65, 'done'],
  [66, 'done'],
  [69, 'done'],
  [70, 'done'],
  [71, 'done'],
  [72, 'done'],
  [73, 'done'],
  [74, 'done'],
  [75, 'done'],
  [76, 'done'],
  [77, 'done'],
  [78, 'done'],
  [79, 'done'],
  [80, 'done'],
  [81, 'done'],
  [82, 'done'],
  [83, 'done'],
  [84, 'done'],
  [85, 'done'],
  [86, 'done'],
  [45, 'done'],
  [24, 'done'],
  [33, 'done'],
  [40, 'done'],
  [52, 'deferred'],
  [63, 'done'],
  [68, 'done'],
  [87, 'done'],
  [88, 'done'],
  [89, 'done'],
  [17, 'done']
]);

const index = {};
for (let reg = 0; reg <= 160; reg += 1) {
  const phase = phaseByReg.get(reg);
  if (!phase) throw new Error(`Missing phase for REG-${String(reg).padStart(3, '0')}`);
  index[`REG-${String(reg).padStart(3, '0')}`] = {
    status: statusOverrides.get(reg) ?? 'open',
    phase,
    lane: trackA.has(reg) ? 'trackA' : trackB.has(reg) ? 'trackB' : 'default',
    dependencies: dependenciesFor(reg, phase).map((dep) => `REG-${String(dep).padStart(3, '0')}`),
    commit:
      reg === 1
        ? '9b7d03f'
      : reg === 2
        ? '625d0c3'
      : reg === 3
        ? 'e014db8'
      : reg === 4
        ? 'b737cf7'
      : reg === 5
        ? '3af12eb'
      : reg === 6
        ? '140f3cd'
      : reg === 7
        ? 'e2315c8'
      : reg === 8
        ? '73f2679'
      : reg === 9
        ? '3d970f7'
      : reg === 14
        ? 'd228daf'
      : reg === 28
        ? '167e0b1'
      : reg === 34
        ? '78f1801'
      : reg === 44
        ? '4c0f6d7'
      : reg === 16
        ? 'f914b22'
      : reg === 23
        ? 'bca9f9e'
      : reg === 26
        ? '7454ea9'
      : reg === 32
        ? '872316a'
      : reg === 35
        ? '1c36162'
      : reg === 36
        ? 'bbbf433'
      : reg === 10
        ? '780d7c5'
      : reg === 11
        ? '1ae0e17'
      : reg === 12
        ? '89b8e9d'
      : reg === 13
        ? '16bd289'
      : reg === 37
        ? '63008d6'
      : reg === 38
        ? '58569fd'
      : reg === 51
        ? 'ad3c8a2'
      : reg === 53
        ? '48f210e'
      : reg === 54
        ? 'ba37742'
      : reg === 55
        ? '1a9cb4d'
      : reg === 59
        ? '7f9fc57'
      : reg === 64
        ? '6264bcf'
      : reg === 67
        ? 'ca83b8c'
      : reg === 90
        ? '97f8e38'
      : reg === 91
        ? 'b556434'
      : reg === 92
        ? '5957db2'
      : reg === 93
        ? '2463285'
      : reg === 94
        ? '93956be'
      : reg === 95
        ? 'ebaa39b'
      : reg === 96
        ? 'fe4e93d'
      : reg === 97
        ? 'PENDING_REG_097'
        : reg === 24
          ? '7daefab'
        : reg === 18
          ? '8c401cb'
          : reg === 19
            ? '71a452d'
          : reg === 20
            ? 'bdc4032'
            : reg === 21
              ? '33b42a1'
            : reg === 22
              ? 'd53f22c'
          : reg === 25
            ? '0fe3422'
        : reg === 45
          ? '965bfd8'
          : reg === 46
            ? '1ee0e33'
          : reg === 47
            ? 'feaf75d'
          : reg === 48
            ? 'f947c6b'
          : reg === 49
            ? 'e1b72af'
            : reg === 50
              ? 'd4fa416'
          : reg === 65
            ? 'cb4988c'
          : reg === 66
            ? '2cd2518'
          : reg === 69
            ? 'de73453'
          : reg === 70
            ? '84ea165'
          : reg === 71
            ? '052c8d0'
          : reg === 72
            ? '4fda4d5'
          : reg === 73
            ? '16b4890'
          : reg === 74
            ? 'd935510'
          : reg === 75
            ? 'dd23ceb'
          : reg === 76
            ? '0782ee2'
          : reg === 77
            ? '59a298d'
          : reg === 78
            ? '7df64a4'
          : reg === 79
            ? '2860cff'
          : reg === 80
            ? '77d66aa'
          : reg === 81
            ? 'ec72c06'
          : reg === 82
            ? '51076b8'
          : reg === 83
            ? 'b7f29ae'
          : reg === 84
            ? '6003a41'
          : reg === 85
            ? '29fe76c'
          : reg === 86
            ? '470bd6a'
              : reg === 15
                  ? 'a1d84fa'
                  : reg === 17
                    ? '8b9aca5'
                    : reg === 33
                      ? 'e704f8a'
                      : reg === 40
                        ? '73d5072'
                        : reg === 63
                          ? '2872acd'
                          : [52, 68].includes(reg)
                            ? 'ce88cf2'
                            : reg === 87
                              ? '6e85d10'
                              : reg === 88
                                ? '7e1d512'
                                : reg === 89
                                  ? 'a735170'
                                  : null,
    updated: '2026-04-25'
  };
}

writeFileSync('docs/agent/REG_STATE_INDEX.json', `${JSON.stringify(index, null, 2)}\n`);
