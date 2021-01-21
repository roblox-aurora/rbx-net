import React from "react";
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

export const DEFAULT_VALUE = "ts";
export const GROUP = "code";
export const TABS = [
    { label: 'roblox-ts', value: 'ts', },
    { label: 'luau', value: 'luau', },
];

const Code = (props) => {
    const [first, second] = props.children;
    console.log(first, second)
    return <Tabs
        defaultValue={DEFAULT_VALUE}
        groupId={GROUP}
        values={TABS}>
        <TabItem value="ts">
            {first}
        </TabItem>
        <TabItem value="luau">
            {second}
        </TabItem>
    </Tabs>;
}

export default Code;