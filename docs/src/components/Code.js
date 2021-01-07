import React from "react";
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

const Code = (props) => {
    const [first, second] = props.children;
    console.log(first, second)
    return <Tabs
        defaultValue="ts"
        groupId="code"
        values={[
            { label: 'roblox-ts', value: 'ts', },
            { label: 'luau', value: 'lua', },
        ]
    }>
        <TabItem value="ts">
            {first}
        </TabItem>
        <TabItem value="lua">
            {second}
        </TabItem>
    </Tabs>;
}

export default Code;