export const SelecteFiledComponent = ({ col, val }) => {
    return<div
        ref={columnFilterButtonRef}
        style={{ position: "relative", display: "inline-block" }}
    >
        <Button
            variant="outlined"
            color="secondary"
            ref={columnFilterButtonRef}
            onClick={() => setFormsColumnFilterOpen((prev) => !prev)}

        >
            <i className="fas fa-columns"></i> Select Fields (
            {selectedFormColumns.length})


        </Button>

        {formsColumnFilterOpen && (
            <div
                ref={formsColumnFilterRef}
                className="ff-column-filter-dropdown"
                style={{
                    position: "absolute",
                    zIndex: 10,
                    top: "calc(100% + 8px)",
                    right: 0,
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    padding: 12,
                    minWidth: 180,
                }}
            >
                <div className="ff-column-checkboxes">
                    {FORMS_AVAILABLE_COLUMNS.map((col) => (
                        <label
                            key={col.key}
                            className="ff-column-check"
                            style={{
                                display: "block",
                                marginBottom: 6,
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selectedFormColumns.includes(col.key)}
                                onChange={() => toggleFormColumn(col.key)}
                            />

                            <span style={{ marginLeft: 8 }}>
                                {col.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        )}
    </div>
}