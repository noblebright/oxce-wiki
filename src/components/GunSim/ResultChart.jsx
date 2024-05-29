import React from "react";
import { BarChart, Bar, LineChart, Label, Line, XAxis, YAxis, Legend, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { truncateEpsilon } from "../../model/utils.js";

const colors = {
    Aimed: "#08519c",
    Snap: "#3182bd",
    Auto: "#6baed6",
    CompareAimed: "#a50f15",
    CompareSnap: "#de2d26",
    CompareAuto: "#fb6a4a",
};

const modes = ["Aimed", "Snap", "Auto"];
// this is a function, not a component, due to children-reading 
function getLineSeries(data, lc, suffix) { //HitRatio, Damage
    const weapon = data.weaponEntry.type;
    const compareWeapon = data.compareWeaponEntry?.type;
    const series = [];
    for(const mode of modes) {
        const key = `${mode}${suffix}`;
        const compareKey = `Compare${mode}${suffix}`;
        if(data.data[0][key] !== undefined) {
            series.push(<Line key={key} type="monoTone" dot={false} name={`${lc(weapon)} ${lc(`STR_${mode.toUpperCase()}_SHOT`)}`} dataKey={key} stroke={colors[mode]} />);
        }
        if(data.data[0][compareKey] !== undefined) {
            series.push(<Line key={compareKey} type="monoTone" dot={false} name={`${lc(compareWeapon)} ${lc(`STR_${mode.toUpperCase()}_SHOT`)}`} dataKey={compareKey} stroke={colors[`Compare${mode}`]} />);
        }
    }
    return series;
}

function LinearCharts({ data, mode, lc }) {
    return (
        <ResponsiveContainer width="90%" height="80%">
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
                <YAxis label={{ value: mode, angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                { getLineSeries(data, lc, mode) }
            </LineChart>
        </ResponsiveContainer>
    );
}

const possibleTTKModes = ["AimedTTK", "SnapTTK", "AutoTTK", "CompareAimedTTK", "CompareSnapTTK", "CompareAutoTTK"];
const stackColors = [
    // from: https://coolors.co/palette/54478c-2c699a-048ba8-0db39e-16db93-83e377-b9e769-efea5a-f1c453-f29e4c
    "#54478C", "#2C699A", "#048BA8", "#0DB39E", "#16DB93", "#83E377", "#B9E769", "#EFEA5A", "#F1C453", "#F29E4C"
];

function getStackedBars(mode) {
    const result = [];
    for(let i = 1; i < 10; i++) {
        const k = `${mode}_${i}`;
        result.push(<Bar key={k} dataKey={k} stackId="a" fill={stackColors[i]} />);
    }
    return result;
}

function TTKChart({ data, mode, height }) {
    return (
        <>
            <div>{mode}</div>
            <ResponsiveContainer width="90%" height={`${height}%`}>
                <BarChart
                    width={500}
                    height={50}
                    margin={{
                        top: 5, right:30, left: 20, bottom: 5
                    }}
                    data={data.data}
                >
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="distance">
                        <Label value="Distance" offset={-5} position="insideBottom" />
                    </XAxis>
                    <YAxis domain={[0, 1]} tickFormatter={truncateEpsilon} label={{ value: "Kill Probability", angle: -90, position: "insideLeft" }}/>
                    <Tooltip />
                    { getStackedBars(mode) }
                </BarChart>
            </ResponsiveContainer>
        </>
    );
}

function TTKCharts(props) {
    const { data, lc } = props;
    const firstNode = data.data[0];
    const modes = Object.keys(firstNode).filter(x => possibleTTKModes.includes(x));
    const height = Math.floor(80 / modes.length);
    return modes.map(mode => <TTKChart key={mode} mode={mode} height={height} data={data} lc={lc} />);
}

export default function ResultChart(props) {
    if(props.mode !== "TTK") {
        return <LinearCharts {...props}/>
    } else {
        return <TTKCharts {...props}/>
    }
}