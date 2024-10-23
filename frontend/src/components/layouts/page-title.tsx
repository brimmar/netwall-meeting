import type { ReactNode } from "react";
import { Helmet } from "react-helmet-async";

import { createTitle } from "@/lib/title";

interface PageTitleProps {
    title: string;
};

const PageTitle = ({ title }: PageTitleProps): ReactNode => {
    const pageTitle = createTitle(title);

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
            </Helmet>
        </>
    );
};

export default PageTitle;
