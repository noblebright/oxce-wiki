import React from "react";
import { LineChart, Line, XAxis, YAxis, Legend, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const colors = {
    AimedHitRatio: "#003f5c",
    SnapHitRatio: "#58508d",
    AutoHitRatio: "#bc5090",
    AimedDamage: "#ff6361",
    SnapDamage: "#ffa600",
    AutoDamage: "#444e86"
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
                { data[0].AimedHitRatio !== undefined && mode === "HitRatio" && <Line type="monoTone" dataKey="AimedHitRatio" stroke={colors.AimedHitRatio}/> }
                { data[0].SnapHitRatio !== undefined && mode === "HitRatio" && <Line type="monoTone" dataKey="SnapHitRatio" stroke={colors.SnapHitRatio}/> }
                { data[0].AutoHitRatio !== undefined && mode === "HitRatio" && <Line type="monoTone" dataKey="AutoHitRatio" stroke={colors.AutoHitRatio}/> }
                { data[0].AimedDamage !== undefined && mode === "Damage" && <Line type="monoTone" dataKey="AimedDamage" stroke={colors.AimedDamage}/> }
                { data[0].SnapDamage !== undefined && mode === "Damage" && <Line type="monoTone" dataKey="SnapDamage" stroke={colors.SnapDamage}/> }
                { data[0].AutoDamage !== undefined && mode === "Damage" && <Line type="monoTone" dataKey="AutoDamage" stroke={colors.AutoDamage}/> }
            </LineChart>
        </ResponsiveContainer>
    )
}