import { Select, type SelectProps } from "antd";
import type { FC } from "react";
import { request } from "../lib/request";
import { useRequest } from "ahooks";
import type { Provider } from "../types";

const ProviderSelect: FC<Omit<SelectProps, "options">> = ({
    ...other
}) => {

    const { data: providers } = useRequest<Provider[], any>(async () => {
        const json = await request.get('/api/ai/providers')
        return json.data.providers
    })

    return <Select
        allowClear
        placeholder='请选择模型'
        {...other}
        options={providers?.map(provider => ({
            label: provider,
            value: provider
        }))} />;
};
export default ProviderSelect;
