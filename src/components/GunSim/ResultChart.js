import React from "react";
import { LineChart, Label, Line, XAxis, YAxis, Legend, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const colors = {
    Aimed: "#08519c",
    Snap: "#3182bd",
    Auto: "#6baed6",
    CompareAimed: "#a50f15",
    CompareSnap: "#de2d26",
    CompareAuto: "#fb6a4a",
};

export default function ResultChart({ data, mode, lc, weapon, compareWeapon }) {
    return (
        <ResponsiveContainer width="90%" height="80%">
            <LineChart
                width={500}
                height={300}
                margin={{
                    top: 5, right:30, left: 20, bottom: 5
                }}
                data={data}
            >
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="distance">
                    <Label value="Distance" offset={-5} position="insideBottom" />
                </XAxis>
                <YAxis name={mode} label={{ value: mode, angle: -90, position: "insideLeft" }}/>
                <Tooltip />
                <Legend />
                { data[0].AimedHitRatio !== undefined && mode === "HitRatio" && 
                    <Line type="monoTone" dot={false} name={`${lc(weapon)} ${lc("STR_AIMED_SHOT")}`} dataKey="AimedHitRatio" stroke={colors.Aimed}/> }
                { data[0].SnapHitRatio !== undefined && mode === "HitRatio" && 
                    <Line type="monoTone" dot={false} name={`${lc(weapon)} ${lc("STR_SNAP_SHOT")}`} dataKey="SnapHitRatio" stroke={colors.Snap}/> }
                { data[0].AutoHitRatio !== undefined && mode === "HitRatio" && 
                    <Line type="monoTone" dot={false} name={`${lc(weapon)} ${lc("STR_AUTO_SHOT")}`} dataKey="AutoHitRatio" stroke={colors.Auto}/> }
                { data[0].AimedDamage !== undefined && mode === "Damage" && 
                    <Line type="monoTone" dot={false} name={`${lc(weapon)} ${lc("STR_AIMED_SHOT")}`} dataKey="AimedDamage" stroke={colors.Aimed}/> }
                { data[0].SnapDamage !== undefined && mode === "Damage" && 
                    <Line type="monoTone" dot={false} name={`${lc(weapon)} ${lc("STR_SNAP_SHOT")}`} dataKey="SnapDamage" stroke={colors.Snap}/> }
                { data[0].AutoDamage !== undefined && mode === "Damage" && 
                    <Line type="monoTone" dot={false} name={`${lc(weapon)} ${lc("STR_AUTO_SHOT")}`} dataKey="AutoDamage" stroke={colors.Auto}/> }
                { data[0].CompareAimedHitRatio !== undefined && mode === "HitRatio" && 
                    <Line type="monoTone" dot={false} name={`${lc(compareWeapon)} ${lc("STR_AIMED_SHOT")}`} dataKey="CompareAimedHitRatio" stroke={colors.CompareAimed}/> }
                { data[0].CompareSnapHitRatio !== undefined && mode === "HitRatio" && 
                    <Line type="monoTone" dot={false} name={`${lc(compareWeapon)} ${lc("STR_SNAP_SHOT")}`} dataKey="CompareSnapHitRatio" stroke={colors.CompareSnap}/> }
                { data[0].CompareAutoHitRatio !== undefined && mode === "HitRatio" && 
                    <Line type="monoTone" dot={false} name={`${lc(compareWeapon)} ${lc("STR_AUTO_SHOT")}`} dataKey="CompareAutoHitRatio" stroke={colors.CompareAuto}/> }
                { data[0].CompareAimedDamage !== undefined && mode === "Damage" && 
                    <Line type="monoTone" dot={false} name={`${lc(compareWeapon)} ${lc("STR_AIMED_SHOT")}`} dataKey="CompareAimedDamage" stroke={colors.CompareAimed}/> }
                { data[0].CompareSnapDamage !== undefined && mode === "Damage" && 
                    <Line type="monoTone" dot={false} name={`${lc(compareWeapon)} ${lc("STR_SNAP_SHOT")}`} dataKey="CompareSnapDamage" stroke={colors.CompareSnap}/> }
                { data[0].CompareAutoDamage !== undefined && mode === "Damage" && 
                    <Line type="monoTone" dot={false} name={`${lc(compareWeapon)} ${lc("STR_AUTO_SHOT")}`} dataKey="CompareAutoDamage" stroke={colors.CompareAuto}/> }
            </LineChart>
        </ResponsiveContainer>
    )
}