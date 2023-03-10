import React, { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RecipeType } from "../types";
import { Avatar, Button, Grid, IconButton, Typography } from "@mui/material";
import { stripHtml } from "string-strip-html";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { AuthContext } from "../context/AuthContext";

const addFavorite = (id: string) => {
    fetch(`/api/user/inventory/favorite/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((data) => {
            console.log("add favorite", data);
        });
};

const removeFavorite = (id: string) => {
    fetch(`/api/user/inventory/favorite/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((data) => {
            console.log("remove favorite", data);
        });
};

const Recipe: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { isAuth, userId } = useContext(AuthContext);
    const [recipe, setRecipe] = React.useState<RecipeType>();
    const [owner, setOwner] = React.useState<string>("");
    const [error, setError] = React.useState<string>("");
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [isFavorite, setIsFavorite] = React.useState(false);
    const [isClicked, setIsClicked] = React.useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuth) {
        }
    }, [isAuth]);
    //mock data

    useEffect(() => {
        if (isAuth) {
            fetch(`/api/user/inventory/pantry`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((res) => res.json())
                .then(
                    (result) => {
                        console.log("pantry", result);
                    },
                    (error) => {
                        setError(error);
                    }
                );
            fetch(`/api/user/inventory/favorite`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((res) => res.json())
                .then(
                    (result) => {
                        console.log("favorites", result);
                        //results is an array of objects with id property
                        //check if id is in array
                        const isFav = result.some(
                            (fav: { recipeId: string }) => fav.recipeId === id
                        );
                        setIsFavorite(isFav);
                    },
                    (error) => {
                        setError(error);
                    }
                );
        }
    }, [isAuth]);
    useEffect(() => {
        //fetch recipe from backend
        fetch(`/api/search/recipe/${id}`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then(
                (result) => {
                    setRecipe(result.recipe.recipe);
                    setOwner(result.recipe.ownerId);
                    setIsLoaded(true);
                },
                (error) => {
                    setError(error);
                    setIsLoaded(true);
                }
            );
    }, [id]);

    if (error) {
        return <div>Error: {error}</div>;
    } else if (!isLoaded) {
        return <div>Loading...</div>;
    } else {
        return (
            <>
                {recipe && (
                    <Grid
                        container
                        spacing={3}
                        sx={{
                            margin: "auto",
                            width: "80%",
                            marginTop: "2rem",
                            marginBottom: "2rem",
                        }}
                    >
                        <Grid item xs={12}>
                            <Typography
                                variant="h4"
                                align="center"
                                gutterBottom
                            >
                                {recipe.title}
                                {owner === userId && (
                                    <IconButton
                                        onClick={() => navigate(`/edit/${id}`)}
                                    >
                                        <BorderColorIcon
                                            style={{ color: "lightblue" }}
                                        />
                                    </IconButton>
                                )}
                                {isAuth ? (
                                    <>
                                        {isFavorite ? (
                                            <IconButton
                                                onClick={() => {
                                                    removeFavorite(id!);
                                                    setIsFavorite(false);
                                                }}
                                            >
                                                <FavoriteIcon
                                                    style={{ color: "red" }}
                                                />
                                            </IconButton>
                                        ) : (
                                            <IconButton
                                                onClick={() => {
                                                    addFavorite(id!);
                                                    setIsFavorite(true);
                                                    setIsClicked(true);
                                                    setTimeout(() => {
                                                        setIsClicked(false);
                                                    }, 300);
                                                }}
                                                className={
                                                    isClicked ? "pop" : ""
                                                }
                                            >
                                                <FavoriteBorderIcon
                                                    style={{ color: "red" }}
                                                />
                                            </IconButton>
                                        )}
                                    </>
                                ) : (
                                    <></>
                                )}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Avatar
                                alt={recipe.title}
                                src={recipe.image}
                                variant="square"
                                style={{
                                    width: "60%",
                                    height: "100%",
                                    margin: "auto",
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {recipe.preparationMinutes > 0 && (
                                <Typography variant="subtitle1">
                                    <b>Prep Time: </b>
                                    {recipe.preparationMinutes} minutes
                                </Typography>
                            )}
                            {recipe.cookingMinutes > 0 && (
                                <Typography variant="subtitle1">
                                    <b>Cook Time: </b>
                                    {recipe.cookingMinutes} minutes
                                </Typography>
                            )}
                            <Typography variant="subtitle1">
                                <b>Servings: </b>
                                {recipe.servings}
                            </Typography>
                            {recipe.cuisines.length > 0 && (
                                <Typography variant="subtitle1">
                                    <b>Cuisines: </b>
                                    {recipe.cuisines.join(", ")}
                                </Typography>
                            )}
                            {recipe.dishTypes.length > 0 && (
                                <Typography variant="subtitle1">
                                    <b>Dish Type: </b>
                                    {recipe.dishTypes.join(", ")}
                                </Typography>
                            )}
                        </Grid>

                        <Grid item xs={12}>
                            <Typography
                                variant="body1"
                                align="justify"
                                gutterBottom
                            >
                                {stripHtml(recipe.summary).result}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                                Ingredients:
                            </Typography>
                            <ul>
                                {recipe.extendedIngredients.map(
                                    (ingredient) => (
                                        <li key={ingredient.id}>
                                            {ingredient.original}
                                        </li>
                                    )
                                )}
                            </ul>
                        </Grid>
                        {recipe.instructions && (
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Instructions:
                                </Typography>
                                <ol>
                                    {recipe.instructions
                                        //split by ". " or ".\n"
                                        .split(/\. |\.\n/)
                                        .filter((step) => step !== "")
                                        .map((step) => (
                                            <li key={step}>{step}</li>
                                        ))}
                                </ol>
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">
                                Source URL:{" "}
                                <a
                                    href={recipe.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {recipe.sourceUrl}
                                </a>
                            </Typography>
                        </Grid>
                    </Grid>
                )}
            </>
        );
    }
};

export default Recipe;
