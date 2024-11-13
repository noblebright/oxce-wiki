import { SectionHeader, UnitStats, ListValue } from "../../ComponentUtils";

export default function SpawnedSoldier({ lc, inventoryFn, ruleset, label = "Spawned Soldier", type, data }) {
    if (!type || !data) return null;

    const commendInventory = (data.diary?.commendations ?? []).map(({ commendationName, decorationLevel }) => [commendationName, decorationLevel + 1]);
    const bonusStats = (data.diary?.commendations ?? []).reduce((acc, { commendationName, decorationLevel }) => {
        const bonusName = ruleset.entries[commendationName].commendations.soldierBonusTypes[decorationLevel];
        const bonus = ruleset.lookups.soldierBonuses[bonusName].stats ?? {};
        Object.entries(bonus).forEach(([k, v]) => {
            acc[k] = (acc[k] ?? 0) + v;
        });
        return acc;
    }, {});
    const baseSoldier = ruleset.entries[type].soldiers;

    return (
        <>
            <SectionHeader label={label} />
            <UnitStats label="Soldier Stats" min={baseSoldier.minStats} max={baseSoldier.maxStats} stats={data.currentStats} lc={lc} bonusStats={bonusStats} showZero={false} />
            <ListValue label="Commendations" values={commendInventory}>{inventoryFn}</ListValue>
        </>
    )
}