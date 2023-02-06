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

function LineChartContainer({ data, children }) {
    return (
        <LineChart
                        width={500}
                        height={300}
                        margin={{
                            top: 5, right:30, left: 20, bottom: 5
                        }}
                        data={data.data}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="distance">
                            <Label value="Distance" offset={-5} position="insideBottom" />
                        </XAxis>
                        <YAxis name={mode} label={{ value: mode, angle: -90, position: "insideLeft" }}/>
                        <Tooltip />
                        <Legend />
                        {children}
        </LineChart>
    )
}
const modes = ["Aimed", "Snap", "Auto"];
function LineSeries({ data, lc, suffix }) { //HitRatio, Damage
    const weapon = data.weaponEntry.type;
    const compareWeapon = data.compareWeaponEntry.type;
    const series = [];
    for(const mode of modes) {
        const key = `${mode}${suffix}`;
        const compareKey = `Compare${mode}${suffix}`;
        if(data.data[0][key]) {
            series.push(<Line key={key} type="monoTone" dot={false} name={`${lc(weapon)} ${lc(`STR_${mode.toUpperCase()}_SHOT`)}`} dataKey={`${mode}${suffix}`} stroke={colors[mode]} />);
        }
        if(data.data[0][compareKey]) {
            series.push(<Line key={compareKey} type="monoTone" dot={false} name={`${lc(compareWeapon)} ${lc(`STR_${mode.toUpperCase()}_SHOT`)}`} dataKey={`${mode}${suffix}`} stroke={colors[`Compare${mode}`]} />);
        }
    }
    return series;
}

export default function ResultChart({ data, mode, lc }) {
    const weapon = data.weaponEntry.type;
    const compareWeapon = data.compareWeaponEntry.type;

    return (
        <ResponsiveContainer width="90%" height="80%">
            <LineChart data={data}>
                <LineSeries data={data} lc={lc} suffix={mode} />
            </LineChart>
        </ResponsiveContainer>
    )
}