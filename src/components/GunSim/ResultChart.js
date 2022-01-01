import React from "react";
import { LineChart, Line, XAxis, YAxis, Legend, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const colors = {
    Aimed: "#08519c",
    Snap: "#3182bd",
    Auto: "#6baed6",
    CompareAimed: "#a50f15",
    CompareSnap: "#de2d26",
    CompareAuto: "#fb6a4a",
};

export default function ResultChart({ data, mode }) {
    return (
        <ResponsiveContainer width="80%" height="80%">
            <LineChart
                width={500}
                height={300}
                margin={{
                    top: 5, right:30, left: 20, bottom: 5
                }}
                data={data}
            >
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="distance"/>
                <YAxis/>
                <Tooltip />
                <Legend />
                { data[0].AimedHitRatio !== undefined && mode === "HitRatio" && <Line type="monoTone" dataKey="AimedHitRatio" stroke={colors.Aimed}/> }
                { data[0].SnapHitRatio !== undefined && mode === "HitRatio" && <Line type="monoTone" dataKey="SnapHitRatio" stroke={colors.Snap}/> }
                { data[0].AutoHitRatio !== undefined && mode === "HitRatio" && <Line type="monoTone" dataKey="AutoHitRatio" stroke={colors.Auto}/> }
                { data[0].AimedDamage !== undefined && mode === "Damage" && <Line type="monoTone" dataKey="AimedDamage" stroke={colors.Aimed}/> }
                { data[0].SnapDamage !== undefined && mode === "Damage" && <Line type="monoTone" dataKey="SnapDamage" stroke={colors.Snap}/> }
                { data[0].AutoDamage !== undefined && mode === "Damage" && <Line type="monoTone" dataKey="AutoDamage" stroke={colors.Auto}/> }
                { data[0].CompareAimedHitRatio !== undefined && mode === "HitRatio" && <Line type="monoTone" dataKey="CompareAimedHitRatio" stroke={colors.CompareAimed}/> }
                { data[0].CompareSnapHitRatio !== undefined && mode === "HitRatio" && <Line type="monoTone" dataKey="CompareSnapHitRatio" stroke={colors.CompareSnap}/> }
                { data[0].CompareAutoHitRatio !== undefined && mode === "HitRatio" && <Line type="monoTone" dataKey="CompareAutoHitRatio" stroke={colors.CompareAuto}/> }
                { data[0].CompareAimedDamage !== undefined && mode === "Damage" && <Line type="monoTone" dataKey="CompareAimedDamage" stroke={colors.CompareAimed}/> }
                { data[0].CompareSnapDamage !== undefined && mode === "Damage" && <Line type="monoTone" dataKey="CompareSnapDamage" stroke={colors.CompareSnap}/> }
                { data[0].CompareAutoDamage !== undefined && mode === "Damage" && <Line type="monoTone" dataKey="CompareAutoDamage" stroke={colors.CompareAuto}/> }
            </LineChart>
        </ResponsiveContainer>
    )
}