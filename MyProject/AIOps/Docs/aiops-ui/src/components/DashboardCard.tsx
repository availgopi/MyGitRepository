import { Card, CardContent, Typography } from "@mui/material";

interface Props {
    title: string;
    value: number;
}

export default function DashboardCard({
    title,
    value
}: Props) {

    return (

        <Card elevation={3}>

            <CardContent>

                <Typography
                    color="text.secondary"
                    gutterBottom
                >
                    {title}
                </Typography>

                <Typography variant="h3">

                    {value}

                </Typography>

            </CardContent>

        </Card>

    );

}